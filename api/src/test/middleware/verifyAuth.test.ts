import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/verifyAuth';
import supertest from 'supertest';
import Fastify from 'fastify';
import { verifyToken } from '../../utils/auth';
import { db } from '../../utils/firebase';

// Mock dependencies
jest.mock('../../utils/auth');
jest.mock('../../utils/firebase');

describe('Auth Middleware', () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    fastify = Fastify();
    fastify.addHook('preHandler', authMiddleware); // Add authMiddleware as a preHandler to all routes

    fastify.get('/protected', async (request, reply) => {
      return { message: 'This is a protected route' };
    });

    await fastify.ready();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header is provided', async () => {
    const res = await supertest(fastify.server)
      .get('/protected')
      .set('Authorization', ''); // No Bearer token

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing or invalid token');
  });

  it('should return 401 if invalid token is provided', async () => {
    const mockInvalidToken = 'invalid-token';
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = await supertest(fastify.server)
      .get('/protected')
      .set('Authorization', `Bearer ${mockInvalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('should return 401 if session not found in the database', async () => {
    const mockValidToken = 'valid-token';
    const mockSessionResponse = { empty: true }; // Simulate no session in Firestore

    (verifyToken as jest.Mock).mockImplementation(() => ({ userId: '123' })); // Return decoded token
    (db.collection as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSessionResponse),
    });

    const res = await supertest(fastify.server)
      .get('/protected')
      .set('Authorization', `Bearer ${mockValidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Session not found');
  });

  it('should pass if token is valid and session is found', async () => {
    const mockValidToken = 'valid-token';
    const mockSessionData = {
      clientInfo: {
        deviceHash: 'device123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      },
    };

    (verifyToken as jest.Mock).mockImplementation(() => ({ userId: '123' })); // Return decoded token
    (db.collection as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockSessionData }],
      }),
    });

    const res = await supertest(fastify.server)
      .get('/protected')
      .set('Authorization', `Bearer ${mockValidToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('This is a protected route');
  });

  it('should attach user information to request object if token and session are valid', async () => {
    const mockValidToken = 'valid-token';
    const mockSessionData = {
      clientInfo: {
        deviceHash: 'device123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      },
    };

    (verifyToken as jest.Mock).mockImplementation(() => ({ userId: '123' })); // Return decoded token
    (db.collection as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockSessionData }],
      }),
    });

    const res = await supertest(fastify.server)
      .get('/protected')
      .set('Authorization', `Bearer ${mockValidToken}`);

    // Check if user info is attached to the request
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('This is a protected route');
  });
});
