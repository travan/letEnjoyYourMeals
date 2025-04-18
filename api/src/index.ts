import Fastify from "fastify";
import {apiRoutes} from "./routes";
const app = Fastify();

app.register(apiRoutes, { prefix: '/api' });

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
