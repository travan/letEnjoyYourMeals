import Fastify from 'fastify';
import supertest from 'supertest';
import { authRoutes } from '../../routes/auth';
import * as authUtils from '../../utils/auth';
import { db } from '../../utils/firebase';

jest.mock('../../utils/auth');
jest.mock('../../utils/firebase');

const mockDb = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  set: jest.fn(),
  get: jest.fn(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  delete: jest.fn(),
};

(db as any).collection = mockDb.collection;
mockDb.collection.mockReturnValue({
  doc: () => ({ set: jest.fn(), get: jest.fn().mockResolvedValue({ exists: false }) }),
  where: () => ({
    limit: () => ({
      get: jest.fn().mockResolvedValue({ empty: true }),
    }),
  }),
});

describe('Auth API routes', () => {
  const fastify = Fastify();

  beforeAll(async () => {
    await fastify.register(authRoutes);
    await fastify.ready();
  });

  afterAll(() => fastify.close());

  describe('POST /auth', () => {
    it('should return 400 if captcha token is missing', async () => {
      const res = await supertest(fastify.server).post('/auth').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing captcha token' });
    });

    it('should return 403 if captcha invalid', async () => {
      (authUtils.verifyCaptcha as jest.Mock).mockResolvedValue(false);

      const res = await supertest(fastify.server).post('/auth').send({ captchaToken: 'abc' });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Captcha validation failed' });
    });

    it('should return 400 if location is missing', async () => {
      (authUtils.verifyCaptcha as jest.Mock).mockResolvedValue(true);
      (authUtils.getClientInfo as jest.Mock).mockReturnValue({ location: null });

      const res = await supertest(fastify.server).post('/auth').send({ captchaToken: 'abc' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing location data' });
    });

    it('should return 403 if location verification fails', async () => {
      (authUtils.verifyCaptcha as jest.Mock).mockResolvedValue(true);
      (authUtils.getClientInfo as jest.Mock).mockReturnValue({
        location: { latitude: 10, longitude: 10 },
        ip: '1.1.1.1',
        deviceHash: 'device123',
      });
      (authUtils.verifyLocation as jest.Mock).mockResolvedValue(false);

      const res = await supertest(fastify.server).post('/auth').send({ captchaToken: 'abc' });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Suspicious location or IP change' });
    });

    it('should return token on successful auth', async () => {
      (authUtils.verifyCaptcha as jest.Mock).mockResolvedValue(true);
      (authUtils.getClientInfo as jest.Mock).mockReturnValue({
        location: { latitude: 10, longitude: 10 },
        ip: '1.1.1.1',
        deviceHash: 'device123',
      });
      (authUtils.verifyLocation as jest.Mock).mockResolvedValue(true);
      (authUtils.generateTokenMiddle as jest.Mock).mockReturnValue('token123');
      (authUtils.storeDevice as jest.Mock).mockResolvedValue(true);
      (authUtils.saveSession as jest.Mock).mockResolvedValue(true);

      const res = await supertest(fastify.server).post('/auth').send({
        captchaToken: 'valid',
        location: { latitude: 10, longitude: 10 },
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ token: 'token123' });
    });
  });

  describe('POST /auth/revoke', () => {
    it('should return 401 if missing Bearer token', async () => {
      const res = await supertest(fastify.server).post('/auth/revoke');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Missing or invalid token' });
    });

    it('should return 401 if invalid token', async () => {
      (authUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid');
      });

      const res = await supertest(fastify.server)
        .post('/auth/revoke')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('should return success when session & token revoked', async () => {
      (authUtils.verifyToken as jest.Mock).mockReturnValue({ device: 'device123' });
      const fakeRef = { delete: jest.fn() };

      mockDb.collection.mockReturnValueOnce({
        where: () => ({
          limit: () => ({
            get: () => Promise.resolve({
              empty: false,
              docs: [{ ref: fakeRef }],
            }),
          }),
        }),
      });

      mockDb.collection.mockReturnValueOnce({
        doc: () => ({
          get: () => Promise.resolve({ exists: true, ref: fakeRef }),
        }),
      });

      const res = await supertest(fastify.server)
        .post('/auth/revoke')
        .set('Authorization', 'Bearer valid');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 if missing token', async () => {
      const res = await supertest(fastify.server).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Missing or invalid token' });
    });

    it('should return 401 if token invalid', async () => {
      (authUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid');
      });

      const res = await supertest(fastify.server)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('should return session if valid', async () => {
      (authUtils.verifyToken as jest.Mock).mockReturnValue({ device: 'abc' });

      mockDb.collection.mockReturnValueOnce({
        where: () => ({
          limit: () => ({
            get: () => Promise.resolve({
              empty: false,
              docs: [{ data: () => ({ clientInfo: {}, token: 't' }) }],
            }),
          }),
        }),
      });

      const res = await supertest(fastify.server)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid');

      expect(res.status).toBe(200);
      expect(res.body.session).toBeDefined();
    });
  });
});
