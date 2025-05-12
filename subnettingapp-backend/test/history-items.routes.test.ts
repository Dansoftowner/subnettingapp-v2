import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import config from 'config';
import jwt from 'jsonwebtoken';

import { app } from '../src/app';
import { HistoryItem } from '../src/models/history-item.model';

import { generalRateLimiterStore } from '../src/rate-limiters';

// Mock jwt.verify to bypass actual token validation
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token: string, secret: string) => ({ id: token })),
}));

describe('HistoryItems API', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await HistoryItem.deleteMany({});
    await generalRateLimiterStore.resetAll()
  });

  const authHeader = () => config.get<string>('jwt.headerName');

  it('GET /api/history-items without token returns 401', async () => {
    const res = await request(app).get('/api/history-items');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authorization token required!');
  });

  it('GET /api/history-items/:id without token returns 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const res = await request(app).get(`/api/history-items/${fakeId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authorization token required!');
  });

  it('POST /api/history-items without token returns 401', async () => {
    const res = await request(app).post('/api/history-items').send({});
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authorization token required!');
  });

  it('PATCH /api/history-items/:id without token returns 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const res = await request(app)
      .patch(`/api/history-items/${fakeId}`)
      .send({ title: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authorization token required!');
  });

  it('GET /api/history-items returns empty list with defaults when authorized', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const res = await request(app)
      .get('/api/history-items')
      .set(authHeader(), userId);

    expect(res.status).toBe(200);
    expect(res.body.offset).toBe(0);
    expect(res.body.limit).toBe(10);
    expect(res.body.items).toEqual([]);
  });

  it('GET /api/history-items pagination and limit cap', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    for (let i = 0; i < 15; i++) {
      await new HistoryItem({ userId, title: `Item${i}` }).save();
    }

    const res = await request(app)
      .get('/api/history-items?offset=5&limit=5')
      .set(authHeader(), userId);
    expect(res.status).toBe(200);
    expect(res.body.offset).toBe(5);
    expect(res.body.limit).toBe(5);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.items[0].title).toBe('Item9');

    const resCap = await request(app)
      .get('/api/history-items?limit=200')
      .set(authHeader(), userId);
    expect(resCap.status).toBe(200);
    expect(resCap.body.limit).toBe(100);
  });

  it('GET /api/history-items/:id for own and others', async () => {
    const ownerId = new mongoose.Types.ObjectId().toHexString();
    const otherId = new mongoose.Types.ObjectId().toHexString();
    const saved = await new HistoryItem({
      userId: ownerId,
      title: 'SingleTest',
    }).save();

    const res = await request(app)
      .get(`/api/history-items/${saved._id}`)
      .set(authHeader(), ownerId);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(saved._id?.toString());
    expect(res.body.title).toBe('SingleTest');

    const res2 = await request(app)
      .get(`/api/history-items/${saved._id}`)
      .set(authHeader(), otherId);
    expect(res2.status).toBe(404);
    expect(res2.body.message).toBe('Not found');
  });

  it('POST /api/history-items creates with defaults and with payload', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const resEmpty = await request(app)
      .post('/api/history-items')
      .set(authHeader(), userId)
      .send({});
    expect(resEmpty.status).toBe(201);
    expect(resEmpty.body.userId).toBe(userId);
    expect(resEmpty.body.title).toBe('');
    expect(resEmpty.body.type).toBeNull();
    expect(resEmpty.body.networkAddress).toBe('');
    expect(resEmpty.body.networkMask).toBeNull();
    expect(resEmpty.body.hostsCounts).toEqual([]);
    expect(resEmpty.body.count).toBeNull();

    const payload = {
      title: 'Populated',
      type: 'sp',
      networkAddress: '192.168.1.0',
      networkMask: 24,
      hostsCounts: [5, 10],
      count: 2,
    };
    const resPop = await request(app)
      .post('/api/history-items')
      .set(authHeader(), userId)
      .send(payload);
    expect(resPop.status).toBe(201);
    expect(resPop.body.title).toBe(payload.title);
    expect(resPop.body.type).toBe(payload.type);
    expect(resPop.body.networkAddress).toBe(payload.networkAddress);
    expect(resPop.body.networkMask).toBe(payload.networkMask);
    expect(resPop.body.hostsCounts).toEqual(payload.hostsCounts);
    expect(resPop.body.count).toBe(payload.count);
  });

  it('PATCH /api/history-items/:id updates own, rejects others and non-existent', async () => {
    const ownerId = new mongoose.Types.ObjectId().toHexString();
    const otherId = new mongoose.Types.ObjectId().toHexString();
    const saved = await new HistoryItem({
      userId: ownerId,
      title: 'Old',
    }).save();

    const resOk = await request(app)
      .patch(`/api/history-items/${saved._id}`)
      .set(authHeader(), ownerId)
      .send({ title: 'NewTitle' });
    expect(resOk.status).toBe(200);
    expect(resOk.body.title).toBe('NewTitle');

    const resNo = await request(app)
      .patch(`/api/history-items/${saved._id}`)
      .set(authHeader(), otherId)
      .send({ title: 'Hack' });
    expect(resNo.status).toBe(404);
    expect(resNo.body.message).toBe('Not found');

    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const res404 = await request(app)
      .patch(`/api/history-items/${fakeId}`)
      .set(authHeader(), ownerId)
      .send({ title: 'Nope' });
    expect(res404.status).toBe(404);
    expect(res404.body.message).toBe('Not found');
  });
});
