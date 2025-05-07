import { FastifyInstance } from "fastify";
import {
  verifyCaptcha,
  getClientInfo,
  generateTokenMiddle,
  saveSession,
  verifyLocation,
  storeDevice,
  verifyToken,
} from "../utils/auth";
import { db } from "../utils/firebase";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth", async (req, reply) => {
    const { captchaToken } = req.body as { captchaToken: string };

    if (!captchaToken) {
      return reply.code(400).send({ error: "Missing captcha token" });
    }

    const validCaptcha = await verifyCaptcha(captchaToken);
    if (!validCaptcha) {
      return reply.code(403).send({ error: "Captcha validation failed" });
    }

    const clientInfo = getClientInfo(req);
    if (!clientInfo.location) {
      return reply.code(400).send({ error: "Missing location data" });
    }

    const validLocation = await verifyLocation(
      clientInfo.deviceHash,
      clientInfo.location,
      clientInfo.ip
    );

    if (!validLocation) {
      return reply.code(403).send({ error: "Suspicious location or IP change" });
    }

    const token = generateTokenMiddle({ device: clientInfo.deviceHash });
    await storeDevice(clientInfo.deviceHash, clientInfo.location, clientInfo.ip);
    await saveSession(clientInfo.deviceHash, { clientInfo, token });

    return reply.send({ token });
  });

  fastify.post("/auth/revoke", async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }

    const sessionSnap = await db
      .collection("authSessions")
      .where("token", "==", token)
      .limit(1)
      .get();

    if (!sessionSnap.empty) {
      await sessionSnap.docs[0].ref.delete();
    }

    const tokenSnap = await db.collection("tokens").doc(token).get();
    if (tokenSnap.exists) {
      await tokenSnap.ref.delete();
    }

    return reply.send({ success: true });
  });

  fastify.get("/auth/me", async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "Missing or invalid token" });
    }
  
    const token = authHeader.split(" ")[1];
  
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }

    const sessionSnap = await db
      .collection("authSessions")
      .where("token", "==", token)
      .limit(1)
      .get();
  
    if (sessionSnap.empty) {
      return reply.code(401).send({ error: "Session revoked or not found" });
    }
  
    const sessionData = sessionSnap.docs[0].data();
    return reply.send({ session: sessionData });
  });
}
