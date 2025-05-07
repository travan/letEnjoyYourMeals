import Fastify from 'fastify';
import supertest from 'supertest';
import { restaurantRoutes } from '../../routes/restaurant';
import { db } from '../../utils/firebase';

jest.mock('../../utils/firebase');

describe('Restaurant Routes', () => {
  const fastify = Fastify();

  beforeAll(async () => {
    fastify.register(restaurantRoutes);
    await fastify.ready();
  });

  afterAll(() => fastify.close());

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET /restaurants - return all', async () => {
    const fakeDocs = [
      { id: 'r1', data: () => ({ name: 'Pizza Place' }) },
      { id: 'r2', data: () => ({ name: 'Sushi Bar' }) },
    ];
    (db.collection as any).mockReturnValue({
      get: () => Promise.resolve({ docs: fakeDocs }),
    });

    const res = await supertest(fastify.server).get('/restaurants');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].id).toBe('r1');
  });

  it('GET /restaurants/:id - found', async () => {
    const fakeDoc = { exists: true, id: 'r1', data: () => ({ name: 'Pizza Place' }) };
    (db.collection as any).mockReturnValue({
      doc: () => ({
        get: () => Promise.resolve(fakeDoc),
      }),
    });

    const res = await supertest(fastify.server).get('/restaurants/r1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Pizza Place');
  });

  it('GET /restaurants/:id - not found', async () => {
    const fakeDoc = { exists: false };
    (db.collection as any).mockReturnValue({
      doc: () => ({
        get: () => Promise.resolve(fakeDoc),
      }),
    });

    const res = await supertest(fastify.server).get('/restaurants/xxx');
    expect(res.status).toBe(404);
  });

  it('POST /restaurants - create one', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({ set: mockSet }),
    });

    const res = await supertest(fastify.server)
      .post('/restaurants')
      .send({ id: 'r3', name: 'Burger Shop' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('r3');
  });

  it('POST /restaurants - batch create', async () => {
    const mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    (db.batch as any).mockReturnValue(mockBatch);
    (db.collection as any).mockReturnValue({
      doc: jest.fn().mockReturnValue({}),
    });

    const res = await supertest(fastify.server)
      .post('/restaurants')
      .send([{ id: 'r1', name: 'Pizza' }, { id: 'r2', name: 'Sushi' }]);

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(2);
  });

  it('POST /restaurants - invalid batch', async () => {
    const res = await supertest(fastify.server)
      .post('/restaurants')
      .send([{ name: 'Missing ID' }]);

    expect(res.status).toBe(400);
  });

  it('PUT /restaurants/:id - update', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({ update: mockUpdate }),
    });

    const res = await supertest(fastify.server)
      .put('/restaurants/r1')
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
  });

  it('DELETE /restaurants/:id - delete', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (db.collection as any).mockReturnValue({
      doc: () => ({ delete: mockDelete }),
    });

    const res = await supertest(fastify.server).delete('/restaurants/r1');
    expect(res.status).toBe(200);
  });
});
