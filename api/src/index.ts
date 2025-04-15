import Fastify from 'fastify';
import { restaurantRoutes } from './routes/restaurant';

const app = Fastify();

app.register(restaurantRoutes);

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});