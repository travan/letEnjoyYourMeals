import { FastifyInstance } from "fastify";
import { db } from "../utils/firebase";
import { Category } from "@shared/data/index";

export async function categoryRoutes(fastify: FastifyInstance) {
  // GET all categories
  fastify.get("/categories", async () => {
    const snapshot = await db.collection("categories").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[];
  });

  // GET one category
  fastify.get("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await db.collection("categories").doc(id).get();

    if (!doc.exists) {
      return reply.code(404).send({ message: "Category not found" });
    }

    return { id: doc.id, ...doc.data() } as Category;
  });

  // CREATE new category
  fastify.post("/categories", async (request, reply) => {
    const data = request.body as Category;
    if (!data.id) {
      return reply.code(400).send({ message: "Missing category ID" });
    }

    await db.collection("categories").doc(data.id).set(data);
    return reply.code(201).send({ message: "Category created", id: data.id });
  });

  // UPDATE category
  fastify.put("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<Category>;

    await db.collection("categories").doc(id).update(data);
    return reply.code(200).send({ message: "Category updated" });
  });

  // DELETE category
  fastify.delete("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    await db.collection("categories").doc(id).delete();
    return reply.code(200).send({ message: "Category deleted" });
  });
}
