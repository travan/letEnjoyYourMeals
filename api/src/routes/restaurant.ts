import { FastifyInstance } from "fastify";
import { db } from "../utils/firebase";
import { Restaurant } from "@shared/data/index";

export async function restaurantRoutes(fastify: FastifyInstance) {
  // GET all restaurants
  fastify.get("/restaurants", async () => {
    const snapshot = await db.collection("restaurants").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Restaurant[];
  });

  // GET one restaurant
  fastify.get("/restaurants/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await db.collection("restaurants").doc(id).get();

    if (!doc.exists) {
      return reply.code(404).send({ message: "Restaurant not found" });
    }

    return { id: doc.id, ...doc.data() } as Restaurant;
  });

  // CREATE new restaurant
  fastify.post("/restaurants", async (request, reply) => {
    const data = request.body as Restaurant;
    if (!data.id) {
      return reply.code(400).send({ message: "Missing restaurant ID" });
    }

    await db.collection("restaurants").doc(data.id).set(data);
    return reply.code(201).send({ message: "Created", id: data.id });
  });

  // UPDATE restaurant
  fastify.put("/restaurants/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<Restaurant>;

    await db.collection("restaurants").doc(id).update(data);
    return reply.code(200).send({ message: "Updated" });
  });

  // DELETE restaurant
  fastify.delete("/restaurants/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    await db.collection("restaurants").doc(id).delete();
    return reply.code(200).send({ message: "Deleted" });
  });
}
