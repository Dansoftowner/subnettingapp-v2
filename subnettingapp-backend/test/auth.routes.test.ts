import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from 'config';
import crypto from 'crypto';
import { User } from '../src/models/user.model';
import { PasswordToken } from '../src/models/password-token.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.setTimeout(20000);

const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mocked-id' });

jest.doMock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
}));

// app must be imported AFTER mocking (that's why it's not imported on the top)
const { app } = require('../src/app');

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterAll(async () => await mongoose.connection.close());
beforeEach(async () => await User.deleteMany({}));

describe('POST /api/registration', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/registration').send({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      fullName: 'Test User',
      email: 'test@example.com',
    });
    expect(res.body).toHaveProperty('id');
  });

  it('should not register duplicate email', async () => {
    await new User({
      fullName: 'Test',
      email: 'dup@example.com',
      password: 'pass',
    }).save();
    const res = await request(app)
      .post('/api/registration')
      .send({ fullName: 'Test', email: 'dup@example.com', password: 'pass' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email already registered');
  });

  it('should save the user in db with hashed password', async () => {
    const email = 'testdb@example.com';
    const fullName = 'DB Test User';
    const password = 'securePass!';
    const res = await request(app)
      .post('/api/registration')
      .send({ fullName, email, password });
    expect(res.status).toBe(201);
    const userInDb = await User.findOne({ email });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.fullName).toBe(fullName);
    expect(userInDb?.password).not.toBe(password);
    const isMatch = await userInDb?.comparePassword(password);
    expect(isMatch).toBe(true);
  });
});

describe('POST /api/login', () => {
  const userData = {
    fullName: 'Login User',
    email: 'login@example.com',
    password: 'password123',
  };
  beforeEach(async () => {
    const user = new User(userData);
    await user.save();
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should login and return token and user info', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: userData.password });
    expect(res.status).toBe(200);
    const token = res.headers[config.get<string>('jwt.headerName')];
    expect(token).toBeDefined();
    const payload: any = jwt.verify(token, config.get('jwt.secret'));
    expect(payload).toHaveProperty('id');
    expect(res.body).toMatchObject({
      fullName: userData.fullName,
      email: userData.email,
      id: payload.id,
    });
  });
});

describe('POST /api/forgotten-password', () => {
  const userData = {
    fullName: 'FP User',
    email: 'fp@example.com',
    password: 'initial123',
  };
  let userId: string;

  beforeEach(async () => {
    sendMailMock.mockClear();

    const user = new User(userData);
    await user.save();
    await PasswordToken.deleteMany();

    userId = user._id.toHexString();
  });

  it('should not fail for unknown email', async () => {
    const nonExistingMail = 'unknown@example.com';
    const res = await request(app)
      .post('/api/forgotten-password')
      .send({ email: nonExistingMail });
    const tokens = await PasswordToken.find();
    expect(res.status).toBe(202);
    expect(tokens).toHaveLength(0);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('should initiate password reset and send email', async () => {
    const res = await request(app)
      .post('/api/forgotten-password')
      .send({ email: userData.email });

    expect(res.status).toBe(202);

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.html).toMatch(new RegExp(userData.fullName));
    expect(mailOptions.html).toMatch(
      new RegExp(
        `${config.get('frontend.host')}/forgotten-password/${userId}/[a-f0-9]{40}`,
      ),
    );

    const record = await PasswordToken.findOne({ userId });
    expect(record).not.toBeNull();
  });
});

describe('POST /api/forgotten-password/:userId/:token', () => {
  const userData = {
    fullName: 'FP User',
    email: 'fp2@example.com',
    password: 'initial123',
  };
  let rawToken: string;
  let userId: string;
  const newPassword = 'newSecret!';

  beforeEach(async () => {
    rawToken = 'b'.repeat(64);

    const user = new User(userData);
    await user.save();
    userId = user._id.toHexString();
    await new PasswordToken({ userId, token: rawToken }).save();
  });

  it('should reset password with valid token', async () => {
    const res = await request(app)
      .post(`/api/forgotten-password/${userId}/${rawToken}`)
      .send({ password: newPassword });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      'message',
      'Password has been reset successfully',
    );

    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(await user!.comparePassword(newPassword)).toBe(true);

    const record = await PasswordToken.findOne({ userId });
    expect(record).toBeNull();
  });

  it('should reject invalid or expired token', async () => {
    const res = await request(app)
      .post(`/api/forgotten-password/${userId}/invalidtoken`)
      .send({ password: newPassword });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
