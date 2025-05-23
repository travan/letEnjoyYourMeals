import { FastifyInstance } from "fastify";
import { db } from "../utils/firebase";
import { Restaurant } from "@shared/data/index";

export async function restaurantRoutes(fastify: FastifyInstance) {
  fastify.get("/restaurants", async () => {
    const snapshot = await db.collection("restaurants").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Restaurant[];
  });

  fastify.get("/restaurants/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await db.collection("restaurants").doc(id).get();

    if (!doc.exists) {
      return reply.code(404).send({ message: "Restaurant not found" });
    }

    return { id: doc.id, ...doc.data() } as Restaurant;
  });

  fastify.post("/restaurants", async (request, reply) => {
    const data = request.body as Restaurant | Restaurant[];

    if (Array.isArray(data)) {
      const validData = data.filter((item) => item?.id);

      if (validData.length === 0) {
        return reply
          .code(400)
          .send({ message: "No valid restaurant entries provided" });
      }

      const batch = db.batch();
      validData.forEach((restaurant) => {
        const ref = db.collection("restaurants").doc(restaurant.id);
        batch.set(ref, restaurant);
      });

      await batch.commit();
      return reply
        .code(201)
        .send({ message: "Batch created", count: validData.length });
    }

    if (!data.id) {
      return reply.code(400).send({ message: "Missing restaurant ID" });
    }

    await db.collection("restaurants").doc(data.id).set(data);
    return reply.code(201).send({ message: "Created", id: data.id });
  });

  fastify.put("/restaurants/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<Restaurant>;

    await db.collection("restaurants").doc(id).update(data);
    return reply.code(200).send({ message: "Updated" });
  });

  fastify.delete("/restaurants/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    await db.collection("restaurants").doc(id).delete();
    return reply.code(200).send({ message: "Deleted" });
  });
}
