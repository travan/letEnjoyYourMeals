import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../utils/auth";
import { db } from "../utils/firebase";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies?.token;

  if (!token) {
    return reply.code(401).send({ error: "Missing auth token in cookie" });
  }

  let decoded: any;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return reply.code(401).send({ error: "Invalid or expired token" });
  }

  const sessionDoc = await db.collection("authSessions").where("token", "==", token).limit(1).get();
  if (sessionDoc.empty) {
    return reply.code(401).send({ error: "Session not found" });
  }

  const session = sessionDoc.docs[0].data();

  (request as any).user = {
    deviceHash: session.clientInfo.deviceHash,
    ip: session.clientInfo.ip,
    userAgent: session.clientInfo.userAgent,
  };
}
