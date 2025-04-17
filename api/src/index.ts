import Fastify from "fastify";
import {
  restaurantRoutes,
  uploadRoutes,
  categoryRoutes,
  commentRoutes,
} from "./routes/index";

const app = Fastify();

app.register(uploadRoutes, { prefix: "/api" });
app.register(restaurantRoutes, { prefix: "/api" });
app.register(categoryRoutes, { prefix: "/api" });
app.register(commentRoutes, { prefix: "/api" });

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
