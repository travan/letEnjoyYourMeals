import Fastify from 'fastify';
import supertest from 'supertest';
import { commentRoutes } from '../../routes/comment';
import { db } from '../../utils/firebase';

jest.mock('../../utils/firebase');

describe('Comment Routes', () => {
  const fastify = Fastify();

  beforeAll(async () => {
    fastify.register(commentRoutes);
    await fastify.ready();
  });

  afterAll(() => fastify.close());
  beforeEach(() => jest.resetAllMocks());

  it('GET /comments - return all', async () => {
    const fakeDocs = [
      { id: 'c1', data: () => ({ text: 'Nice food!' }) },
      { id: 'c2', data: () => ({ text: 'Great service!' }) },
    ];
    (db.collection as any).mockReturnValue({
      get: () => Promise.resolve({ docs: fakeDocs }),
    });

    const res = await supertest(fastify.server).get('/comments');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].id).toBe('c1');
  });

  it('GET /comments?restaurantId=x - filtered', async () => {
    const fakeDocs = [
      { id: 'c3', data: () => ({ text: 'Awesome', restaurantId: 'r1' }) },
    ];
    (db.collection as any).mockReturnValue({
      where: () => ({
        get: () => Promise.resolve({ docs: fakeDocs }),
      }),
    });

    const res = await supertest(fastify.server).get('/comments?restaurantId=r1');
    expect(res.status).toBe(200);
    expect(res.body[0].restaurantId).toBe('r1');
  });

  it('GET /comments/:id - found', async () => {
    const doc = { exists: true, id: 'c1', data: () => ({ text: 'Hello' }) };
    (db.collection as any).mockReturnValue({
      doc: () => ({ get: () => Promise.resolve(doc) }),
    });

    const res = await supertest(fastify.server).get('/comments/c1');
    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Hello');
  });

  it('GET /comments/:id - not found', async () => {
    const doc = { exists: false };
    (db.collection as any).mockReturnValue({
      doc: () => ({ get: () => Promise.resolve(doc) }),
    });

    const res = await supertest(fastify.server).get('/comments/xxx');
    expect(res.status).toBe(404);
  });

  it('POST /comments - batch create', async () => {
    const mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    (db.batch as any).mockReturnValue(mockBatch);
    (db.collection as any).mockReturnValue({
      doc: jest.fn().mockReturnValue({}),
    });

    const res = await supertest(fastify.server)
      .post('/comments')
      .send([{ id: 'c1', text: 'Yummy', restaurantId: 'r1' }]);

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(1);
    expect(mockBatch.set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      text: 'Yummy',
      likes: 0,
      replies: [],
    }));
  });

  it('PUT /comments/:id - update', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({ update: mockUpdate }),
    });

    const res = await supertest(fastify.server)
      .put('/comments/c1')
      .send({ text: 'Edited comment' });

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      text: 'Edited comment',
      updatedAt: expect.any(String),
    }));
  });

  it('DELETE /comments/:id - delete', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({ delete: mockDelete }),
    });

    const res = await supertest(fastify.server).delete('/comments/c1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted');
  });
});
