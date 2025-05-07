import Fastify from 'fastify';
import supertest from 'supertest';
import { categoryRoutes } from '../../routes/category';
import { db } from '../../utils/firebase';

jest.mock('../../utils/firebase');
const mockDb = {
  collection: jest.fn(),
  doc: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  batch: jest.fn(),
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('Category Routes', () => {
  const fastify = Fastify();

  beforeAll(async () => {
    fastify.register(categoryRoutes);
    await fastify.ready();
  });

  afterAll(() => fastify.close());

  it('GET /categories - return all categories', async () => {
    const fakeDocs = [
      { id: 'cat1', data: () => ({ name: 'Food' }) },
      { id: 'cat2', data: () => ({ name: 'Drink' }) },
    ];
    (db.collection as any).mockReturnValue({
      get: () => Promise.resolve({ docs: fakeDocs }),
    });

    const res = await supertest(fastify.server).get('/categories');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].id).toBe('cat1');
  });

  it('GET /categories/:id - found', async () => {
    const fakeDoc = { exists: true, id: 'cat1', data: () => ({ name: 'Food' }) };
    (db.collection as any).mockReturnValue({
      doc: () => ({
        get: () => Promise.resolve(fakeDoc),
      }),
    });

    const res = await supertest(fastify.server).get('/categories/cat1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('cat1');
  });

  it('GET /categories/:id - not found', async () => {
    const fakeDoc = { exists: false };
    (db.collection as any).mockReturnValue({
      doc: () => ({
        get: () => Promise.resolve(fakeDoc),
      }),
    });

    const res = await supertest(fastify.server).get('/categories/cat404');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('POST /categories - missing array', async () => {
    const res = await supertest(fastify.server)
      .post('/categories')
      .send({}); // not array
    expect(res.status).toBe(400);
  });

  it('POST /categories - one item missing id', async () => {
    const res = await supertest(fastify.server)
      .post('/categories')
      .send([{ name: 'Missing ID' }]);
    expect(res.status).toBe(400);
  });

  it('POST /categories - success', async () => {
    const mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    (db.batch as any).mockReturnValue(mockBatch);
    (db.collection as any).mockReturnValue({
      doc: jest.fn().mockReturnValue({}),
    });

    const res = await supertest(fastify.server)
      .post('/categories')
      .send([{ id: 'cat1', name: 'New Category' }]);

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(1);
  });

  it('PUT /categories/:id - success', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({
        update: mockUpdate,
      }),
    });

    const res = await supertest(fastify.server)
      .put('/categories/cat1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('DELETE /categories/:id - success', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({
        delete: mockDelete,
      }),
    });

    const res = await supertest(fastify.server).delete('/categories/cat1');
    expect(res.status).toBe(200);
  });
});
