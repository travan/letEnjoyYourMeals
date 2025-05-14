
import fastify from "fastify";
import cookie from "@fastify/cookie";
import { authRoutes } from "../../routes/auth";
import * as authUtils from "../../utils/auth";
import { db } from "../../utils/firebase";

jest.mock("../../utils/auth");
jest.mock("../../utils/firebase");

const mockedAuth = authUtils as jest.Mocked<typeof authUtils>;
const mockedDb = db as any;

describe("Auth Routes", () => {
  let app: ReturnType<typeof fastify>;

  beforeAll(async () => {
    app = fastify();
    app.register(cookie);
    app.register(authRoutes);
    await app.ready();
  });

  afterAll(() => app.close());

  test("GET /auth/captcha returns captcha data", async () => {
    mockedAuth.generateCaptcha.mockResolvedValue({
      captchaId: "123abc",
      question: "Enter this code: 456def",
    });

    const res = await app.inject({
      method: "GET",
      url: "/auth/captcha",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      captchaId: "123abc",
      question: "Enter this code: 456def",
    });
  });

  test("POST /auth with missing captcha", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth",
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: "Missing captcha information" });
  });

  test("POST /auth with invalid captcha", async () => {
    mockedAuth.verifyCaptchaToken.mockResolvedValue(false);

    const res = await app.inject({
      method: "POST",
      url: "/auth",
      payload: { captchaId: "abc", captchaToken: "wrong" },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "Captcha validation failed" });
  });

  test("POST /auth with valid flow", async () => {
    mockedAuth.verifyCaptchaToken.mockResolvedValue(true);
    mockedAuth.getClientInfo.mockReturnValue({
      ip: "127.0.0.1",
      userAgent: "test-agent",
      deviceHash: "hash123",
      location: { latitude: 10, longitude: 106 },
    });
    mockedAuth.verifyLocation.mockResolvedValue(true);
    mockedAuth.generateTokenMiddle.mockReturnValue("token123");
    mockedAuth.storeDevice.mockResolvedValue(undefined);
    mockedAuth.saveSession.mockResolvedValue("sessionId");

    const res = await app.inject({
      method: "POST",
      url: "/auth",
      payload: { captchaId: "abc", captchaToken: "right" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ success: true });
    expect(res.cookies[0].name).toBe("token");
  });

  test("POST /auth/revoke with valid token", async () => {
    mockedAuth.verifyToken.mockReturnValue({ device: "abc" });

    const mockSession = {
      empty: false,
      docs: [{ ref: { delete: jest.fn() } }],
    };
    const mockToken = { exists: true, ref: { delete: jest.fn() } };

    mockedDb.collection = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSession),
      doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(mockToken) }),
    });

    const res = await app.inject({
      method: "POST",
      url: "/auth/revoke",
      cookies: { token: "token123" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ success: true });
  });

  test("GET /auth/me with missing token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "Missing token" });
  });

  test("GET /auth/me with revoked session", async () => {
    mockedAuth.verifyToken.mockReturnValue({ device: "abc" });
    const mockSession = { empty: true };

    mockedDb.collection = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSession),
    });

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      cookies: { token: "token123" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "Session revoked or not found" });
  });
});
