import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      deviceHash: string;
      ip: string;
      userAgent: string;
      location: any;
    };
  }
}