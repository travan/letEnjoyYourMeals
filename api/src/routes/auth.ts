import { FastifyInstance } from "fastify";
import {
  generateCaptcha,
  verifyCaptchaToken,
  getClientInfo,
  generateTokenMiddle,
  saveSession,
  verifyLocation,
  storeDevice,
  verifyToken,
} from "../utils/auth";
import { db } from "../utils/firebase";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get("/auth/captcha", async (_, reply) => {
    const captcha = await generateCaptcha();
    return reply.send(captcha);
  });

  fastify.post("/auth", async (req, reply) => {
    const { captchaId, captchaToken } = req.body as {
      captchaId: string;
      captchaToken: string;
    };

    if (!captchaId || !captchaToken) {
      return reply.code(400).send({ error: "Missing captcha information" });
    }

    const validCaptcha = await verifyCaptchaToken(captchaId, captchaToken);
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
      return reply
        .code(403)
        .send({ error: "Suspicious location or IP change" });
    }

    const token = generateTokenMiddle({ device: clientInfo.deviceHash });
    await storeDevice(
      clientInfo.deviceHash,
      clientInfo.location,
      clientInfo.ip
    );
    await saveSession(clientInfo.deviceHash, { clientInfo, token });

    reply.setCookie("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 60 * 60 * 24,
    });

    return reply.send({ success: true });
  });

  fastify.post("/auth/revoke", async (req, reply) => {
    const token = req.cookies.token;

    if (!token) {
      return reply.code(401).send({ error: "Missing token" });
    }

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

    reply.clearCookie("token", { path: "/" });

    return reply.send({ success: true });
  });

  fastify.get("/auth/me", async (req, reply) => {
    const token = req.cookies.token;

    if (!token) {
      return reply.code(401).send({ error: "Missing token" });
    }

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch {
      reply.clearCookie("token", { path: "/" });
      return reply.code(401).send({ error: "Invalid or expired token" });
    }

    const sessionSnap = await db
      .collection("authSessions")
      .where("token", "==", token)
      .limit(1)
      .get();

    if (sessionSnap.empty) {
      reply.clearCookie("token", { path: "/" });
      return reply.code(401).send({ error: "Session revoked or not found" });
    }

    const sessionData = sessionSnap.docs[0].data();
    return reply.send({ session: sessionData });
  });
}
