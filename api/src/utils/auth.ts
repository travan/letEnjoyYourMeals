import crypto, { randomBytes } from "crypto";
import { FastifyRequest } from "fastify";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { db } from "./firebase";
import { GeoPoint } from "firebase-admin/firestore";

export type SessionData = {
  clientInfo: {
    ip: string;
    userAgent: string;
    deviceHash: string;
    location?: GeoPoint;
  };
  token: string;
};

export function hashDeviceId(deviceId: string) {
  return crypto.createHash("sha256").update(deviceId).digest("hex");
}

export async function generateCaptcha() {
  const value = randomBytes(3).toString("hex");
  const captchaId = randomBytes(8).toString("hex");

  await db.collection("captchas").doc(captchaId).set({
    value,
    createdAt: Date.now(),
    used: false,
  });

  return { captchaId, question: `Enter this code: ${value}` };
}

export async function verifyCaptchaToken(captchaId: string, userInput: string) {
  const doc = await db.collection("captchas").doc(captchaId).get();
  if (!doc.exists) return false;

  const data: any = doc.data();
  const expired = Date.now() - data.createdAt > 5 * 60 * 1000;
  if (data.used || expired) return false;

  if (data.value.toLowerCase() !== userInput.toLowerCase()) return false;

  await doc.ref.update({ used: true });
  return true;
}

export function generateTokenMiddle(payload: any): string {
  const usedSecret = process.env.JWT_SECRET;
  if (!usedSecret) throw new Error("JWT_SECRET not defined");
  return jwt.sign(payload, usedSecret, { expiresIn: "15m" });
}

export function verifyToken(token: string): any {
  const usedSecret = process.env.JWT_SECRET;
  if (!usedSecret) throw new Error("JWT_SECRET not defined");
  return jwt.verify(token, usedSecret);
}

export function getClientInfo(request: FastifyRequest) {
  const ip =
    request.headers["x-forwarded-for"]?.toString().split(",")[0] || request.ip;
  const userAgent = request.headers["user-agent"] || "unknown";
  const fingerprintRaw = `${ip}|${userAgent}`;

  const deviceHash = crypto
    .createHash("sha256")
    .update(fingerprintRaw)
    .digest("hex");

  const location =
    (request.body as any)?.location || (request.query as any)?.location || null;

  return {
    ip,
    userAgent,
    deviceHash,
    location,
  };
}

export async function storeDevice(
  deviceHash: string,
  location: GeoPoint,
  ip: string
) {
  await db
    .collection("devices")
    .doc(deviceHash)
    .set({ deviceHash, location, ip, updatedAt: Date.now() });
}

export async function saveSession(userId: string, data: SessionData) {
  const sessionId = uuidv4();
  await db
    .collection("authSessions")
    .doc(sessionId)
    .set({
      ...data,
      userId,
      sessionId,
    });
  return sessionId;
}

function haversineDistance(coord1: GeoPoint, coord2: GeoPoint): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function verifyLocation(
  deviceHash: string,
  location: GeoPoint,
  ip: string,
  thresholdKm = 100
): Promise<boolean> {
  const doc = await db.collection("devices").doc(deviceHash).get();
  if (!doc.exists) return true;

  const prev = doc.data();
  const sameIP = prev?.ip === ip;
  const prevLocation = prev?.location as GeoPoint;
  const distance = haversineDistance(prevLocation, location);

  return sameIP && distance <= thresholdKm;
}
