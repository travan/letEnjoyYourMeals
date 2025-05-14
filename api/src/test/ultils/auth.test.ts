
import crypto from "crypto";
import { GeoPoint } from "firebase-admin/firestore";
import * as auth from "../../utils/auth";
import { db } from "../../utils/firebase";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../utils/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        ref: { update: jest.fn() },
      })),
    })),
  },
}));

jest.mock("jsonwebtoken");
jest.mock("uuid", () => ({ v4: jest.fn(() => "mocked-session-id") }));

describe("Authentication utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("hashDeviceId should hash using sha256", () => {
    const deviceId = "abc123";
    const hash = auth.hashDeviceId(deviceId);
    const expected = crypto.createHash("sha256").update(deviceId).digest("hex");
    expect(hash).toBe(expected);
  });

  it("generateCaptcha should create captcha and store in Firestore", async () => {
    const setMock = jest.fn();
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ set: setMock })),
    });
    const result = await auth.generateCaptcha();
    expect(result).toHaveProperty("captchaId");
    expect(result).toHaveProperty("question");
    expect(setMock).toHaveBeenCalled();
  });

  it("verifyCaptchaToken should return true on valid token", async () => {
    const updateMock = jest.fn();
    const getMock = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        value: "code",
        createdAt: Date.now(),
        used: false,
      }),
      ref: { update: updateMock },
    });
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ get: getMock })),
    });
    const result = await auth.verifyCaptchaToken("id", "code");
    expect(result).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({ used: true });
  });

  it("verifyCaptchaToken should return false on expired or used", async () => {
    const expiredDoc = {
      exists: true,
      data: () => ({
        value: "code",
        createdAt: Date.now() - 6 * 60 * 1000,
        used: false,
      }),
    };
    const usedDoc = {
      exists: true,
      data: () => ({
        value: "code",
        createdAt: Date.now(),
        used: true,
      }),
    };
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ get: jest.fn().mockResolvedValue(expiredDoc) })),
    });
    expect(await auth.verifyCaptchaToken("x", "code")).toBe(false);

    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ get: jest.fn().mockResolvedValue(usedDoc) })),
    });
    expect(await auth.verifyCaptchaToken("x", "code")).toBe(false);
  });

  it("generateTokenMiddle and verifyToken should work with JWT", () => {
    (jwt.sign as jest.Mock).mockReturnValue("token123");
    const token = auth.generateTokenMiddle({ user: "abc" });
    expect(token).toBe("token123");

    (jwt.verify as jest.Mock).mockReturnValue({ user: "abc" });
    const verified = auth.verifyToken("token123");
    expect(verified).toEqual({ user: "abc" });
  });

  it("getClientInfo should parse ip, ua, and location", () => {
    const req: any = {
      headers: {
        "x-forwarded-for": "1.2.3.4",
        "user-agent": "agent",
      },
      ip: "2.3.4.5",
      body: { location: "loc" },
      query: {},
    };
    const info = auth.getClientInfo(req);
    expect(info.ip).toBe("1.2.3.4");
    expect(info.userAgent).toBe("agent");
    expect(info.deviceHash).toBeDefined();
    expect(info.location).toBe("loc");
  });

  it("storeDevice should save device data", async () => {
    const setMock = jest.fn();
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ set: setMock })),
    });
    const geo = new GeoPoint(10, 106);
    await auth.storeDevice("hash", geo, "1.2.3.4");
    expect(setMock).toHaveBeenCalled();
  });

  it("saveSession should store and return sessionId", async () => {
    const setMock = jest.fn();
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ set: setMock })),
    });
    const result = await auth.saveSession("user", {
      token: "token",
      clientInfo: {
        ip: "1.2.3.4",
        userAgent: "agent",
        deviceHash: "hash",
      },
    });
    expect(result).toBe("mocked-session-id");
    expect(setMock).toHaveBeenCalled();
  });

  it("verifyLocation should accept new device", async () => {
    const getMock = jest.fn().mockResolvedValue({ exists: false });
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ get: getMock })),
    });
    const result = await auth.verifyLocation("hash", new GeoPoint(0, 0), "ip");
    expect(result).toBe(true);
  });

  it("verifyLocation should validate ip and distance", async () => {
    const prev = {
      ip: "1.2.3.4",
      location: new GeoPoint(10, 106),
    };
    const getMock = jest.fn().mockResolvedValue({
      exists: true,
      data: () => prev,
    });
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ get: getMock })),
    });
    const result = await auth.verifyLocation("hash", new GeoPoint(10.01, 106.01), "1.2.3.4");
    expect(result).toBe(true);
  });

  it("verifyLocation should reject wrong ip or far distance", async () => {
    const prev = {
      ip: "1.2.3.4",
      location: new GeoPoint(0, 0),
    };
    const getMock = jest.fn().mockResolvedValue({
      exists: true,
      data: () => prev,
    });
    (db.collection as any).mockReturnValue({
      doc: jest.fn(() => ({ get: getMock })),
    });
    const result = await auth.verifyLocation("hash", new GeoPoint(50, 50), "9.9.9.9");
    expect(result).toBe(false);
  });
});
