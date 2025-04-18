import { restaurantRoutes } from './restaurant';
import { uploadRoutes } from './upload';
import { categoryRoutes } from './category';
import { commentRoutes } from './comment';
import { FastifyInstance } from 'fastify';

export async function apiRoutes(fastify: FastifyInstance) {
  restaurantRoutes(fastify);
  uploadRoutes(fastify);
  categoryRoutes(fastify);
  commentRoutes(fastify);
}