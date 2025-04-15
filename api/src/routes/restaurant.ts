import { FastifyInstance } from 'fastify';
import { db } from '../utils/firebase';
import { Restaurant } from '../models/restaurant';

export async function restaurantRoutes(fastify: FastifyInstance) {
  fastify.get('/restaurants', async () => {
    const snapshot = await db.collection('restaurants').get();
    return snapshot.docs.map(doc => doc.data() as Restaurant);
  });

  fastify.post('/restaurants', async (request, reply) => {
    const data = request.body as Restaurant;
    await db.collection('restaurants').doc(data.id).set(data);
    reply.code(201).send({ message: 'Created' });
  });
}