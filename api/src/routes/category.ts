import { FastifyInstance } from "fastify";
import { db } from "../utils/firebase";
import { Category } from "@shared/data/index";

export async function categoryRoutes(fastify: FastifyInstance) {
  // GET all categories
  fastify.get("/categories", async () => {
    const snapshot = await db.collection("categories").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
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
    const data = request.body as Category[];

    if (!Array.isArray(data) || data.length === 0) {
      return reply.code(400).send({ message: "No categories provided" });
    }

    const batch = db.batch();

    for (const category of data) {
      if (!category.id) {
        return reply
          .code(400)
          .send({ message: "Missing category ID for one item" });
      }

      const docRef = db.collection("categories").doc(category.id);
      batch.set(docRef, category);
    }

    await batch.commit();

    return reply.code(201).send({
      message: "Categories created",
      count: data.length,
    });
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
