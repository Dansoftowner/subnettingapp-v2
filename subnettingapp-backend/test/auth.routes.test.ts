import { app } from '../src/app';
import config from 'config';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/user.model';

jest.setTimeout(10000);

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

  it('should return 400 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: 'wrongpassword' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
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
