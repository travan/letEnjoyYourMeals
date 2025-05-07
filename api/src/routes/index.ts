import { FastifyInstance } from "fastify";
import { restaurantRoutes } from "./restaurant";
import { uploadRoutes } from "./upload";
import { categoryRoutes } from "./category";
import { commentRoutes } from "./comment";
import { authRoutes } from "./auth";
import { authMiddleware } from "../middleware/verifyAuth";

export async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(async function (protectedRoutes) {
    protectedRoutes.addHook("preHandler", authMiddleware);

    restaurantRoutes(protectedRoutes);
    uploadRoutes(protectedRoutes);
    categoryRoutes(protectedRoutes);
    commentRoutes(protectedRoutes);
  });

  //auth
  authRoutes(fastify);
}
