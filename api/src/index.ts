import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { apiRoutes } from "./routes";
import dotenv from "dotenv";
dotenv.config();

const app = Fastify();

app.register(fastifyCors, {
  origin: "http://localhost:5173",
  credentials: true,
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET!,
});

app.register(apiRoutes, { prefix: "/api" });

app.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
