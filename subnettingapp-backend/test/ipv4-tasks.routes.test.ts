import request from 'supertest';
import { app } from '../src/app';

describe('IPv4 Task API Endpoints', () => {
  /**
   * Test /api/ipv4-task/si (Network Info)
   */
  describe('POST /api/ipv4-task/si', () => {
    it('should return network info for a valid /24 network', async () => {
      const res = await request(app)
        .post('/api/ipv4-task/si')
        .send({ networkAddress: '192.168.1.0', networkMask: 24 })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body).toMatchObject({
        networkAddress: '192.168.1.0',
        networkMask: '/24',
        type: 'si',
        hostsCounts: [],
      });
      expect(res.body.entries).toHaveLength(1);
      const entry = res.body.entries[0];
      expect(entry).toMatchObject({
        subnetAddress: '192.168.1.0',
        firstHostAddress: '192.168.1.1',
        lastHostAddress: '192.168.1.254',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        subnetMaskBitCount: 24,
        hosts: 254,
        hostsUsed: 0,
      });
    });

    it('should return 400 for invalid IP', async () => {
      await request(app)
        .post('/api/ipv4-task/si')
        .send({ networkAddress: '999.999.999.999', networkMask: 24 })
        .expect(400);
    });
  });

  /**
   * Test /api/ipv4-task/sp (Subnet Partitioning)
   */
  describe('POST /api/ipv4-task/sp', () => {
    it('should partition a /27 into [14,5] correctly', async () => {
      const body = {
        networkAddress: '10.0.0.0',
        networkMask: 27,
        hostsCounts: [14, 5],
      };
      const res = await request(app)
        .post('/api/ipv4-task/sp')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body).toMatchObject({
        networkAddress: '10.0.0.0',
        networkMask: '/27',
        type: 'sp',
        hostsCounts: [14, 5],
      });
      expect(res.body.entries).toHaveLength(2);
      const [sub1, sub2] = res.body.entries;
      expect(sub1.subnetAddress).toBe('10.0.0.0');
      expect(sub1.broadcastAddress).toBe('10.0.0.15');
      expect(sub1.subnetMaskBitCount).toBe(28);
      expect(sub1.hosts).toBe(14);
      expect(sub1.hostsUsed).toBe(14);

      expect(sub2.subnetAddress).toBe('10.0.0.16');
      expect(sub2.broadcastAddress).toBe('10.0.0.23');
      expect(sub2.subnetMaskBitCount).toBe(29);
      expect(sub2.hosts).toBe(6);
      expect(sub2.hostsUsed).toBe(5);
    });

    it('should return 400 when capacity is insufficient', async () => {
      const body = {
        networkAddress: '10.0.0.0',
        networkMask: 27,
        hostsCounts: [20, 10, 5],
      };
      await request(app).post('/api/ipv4-task/sp').send(body).expect(400);
    });
  });

  /**
   * Test /api/ipv4-task/rp (Regular Partitioning)
   */
  describe('POST /api/ipv4-task/rp', () => {
    it('should split a /26 into 4 equal /28 subnets', async () => {
      const body = {
        networkAddress: '202.54.9.192',
        networkMask: 26,
        count: 4,
      };
      const res = await request(app)
        .post('/api/ipv4-task/rp')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body).toMatchObject({
        networkAddress: '202.54.9.192',
        networkMask: '/28',
        type: 'rp',
        hostsCounts: [14, 14, 14, 14],
      });
      expect(res.body.entries).toHaveLength(4);
      const networks = res.body.entries.map((e: any) => e.subnetAddress);
      expect(networks).toEqual([
        '202.54.9.192',
        '202.54.9.208',
        '202.54.9.224',
        '202.54.9.240',
      ]);
    });

    it('should return 400 for non-power-of-two count', async () => {
      const body = { networkAddress: '192.168.0.0', networkMask: 24, count: 3 };
      await request(app).post('/api/ipv4-task/rp').send(body).expect(400);
    });

    it('should return 400 when count exceeds max possible', async () => {
      const body = { networkAddress: '10.0.0.0', networkMask: 26, count: 64 };
      await request(app).post('/api/ipv4-task/rp').send(body).expect(400);
    });
  });
});
