import { FastifyInstance } from "fastify";
import { db } from "../utils/firebase";
import { Comment } from "@shared/data/index";

export async function commentRoutes(fastify: FastifyInstance) {
  fastify.get("/comments", async (request) => {
    const restaurantId = (request.query as any).restaurantId;
    const collection = db.collection("comments");
    const snapshot = restaurantId
      ? await collection.where("restaurantId", "==", restaurantId).get()
      : await collection.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
  });

  fastify.get("/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await db.collection("comments").doc(id).get();

    if (!doc.exists) {
      return reply.code(404).send({ message: "Comment not found" });
    }

    return { id: doc.id, ...doc.data() } as Comment;
  });

  fastify.post("/comments", async (request, reply) => {
    const data = request.body as Comment[];
    const now = new Date().toISOString();

    const batch = db.batch();

    for (const comment of data) {
      const docRef = db.collection("comments").doc(comment.id);
      batch.set(docRef, {
        ...comment,
        createdAt: now,
        updatedAt: now,
        likes: comment.likes || 0,
        replies: comment.replies || [],
      });
    }

    await batch.commit();

    return reply
      .code(201)
      .send({ message: "Multiple comments created", count: data.length });
  });

  fastify.put("/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<Comment>;

    data.updatedAt = new Date().toISOString();
    await db.collection("comments").doc(id).update(data);
    return reply.send({ message: "Comment updated" });
  });

  fastify.delete("/comments/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.collection("comments").doc(id).delete();
    return reply.send({ message: "Comment deleted" });
  });
}
