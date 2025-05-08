process.env.JWT_SECRET = "test-secret";
process.env.RECAPTCHA_SECRET = "dummy-recaptcha-secret";

import {
  hashDeviceId,
  verifyCaptcha,
  generateTokenMiddle,
  verifyToken,
  getClientInfo,
  storeDevice,
  saveSession,
  verifyLocation,
} from "../../utils/auth";
import { db } from "../../utils/firebase";
import jwt from "jsonwebtoken";
import { GeoPoint } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import { FastifyRequest } from "fastify";
import crypto from "node:crypto";

// reset mocks
jest.mock("node-fetch", () => jest.fn());
jest.mock("firebase-admin/firestore", () => {
  return {
    GeoPoint: class {
      latitude: number;
      longitude: number;
      constructor(lat: number, lng: number) {
        this.latitude = lat;
        this.longitude = lng;
      }
    },
  };
});

jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-session-id") }));
jest.mock("../../utils/firebase", () => ({
  db: {
    collection: jest.fn()
  }
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-token"), 
  verify: jest.fn(),
}));
jest.mock("../../utils/firebase");

beforeAll(() => {
  globalThis.fetch = jest.fn();
});

describe("hashDeviceId", () => {
  it("should return a valid hashed device ID", () => {
    const deviceId = "device-123";
    const hashed = hashDeviceId(deviceId);
    expect(hashed).toHaveLength(64); // SHA-256 hash length
  });
});

// Test for verifyCaptcha function
describe("verifyCaptcha", () => {
  it("should return true for valid captcha response", async () => {
    const mockResponse = {
      success: true,
      score: 0.9,
    };
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const token = "valid-captcha-token";
    const result = await verifyCaptcha(token);

    expect(result).toBe(true);
  });

  it("should return false for invalid captcha response", async () => {
    const mockResponse = {
      success: false,
      score: 0.3,
    };
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const token = "invalid-captcha-token";
    const result = await verifyCaptcha(token);

    expect(result).toBe(false);
  });
});

// Test for generateTokenMiddle function
describe("generateTokenMiddle", () => {
  it("should generate a JWT token", () => {
    const payload = { userId: "user-123" };
    const secret = "test-secret";
    process.env.JWT_SECRET = secret;

    const token = generateTokenMiddle(payload);

    expect(token).toBeDefined();
    expect(jwt.sign).toHaveBeenCalledWith(payload, secret, {
      expiresIn: "15m",
    });
  });
});

// Test for verifyToken function
describe("verifyToken", () => {
  it("should verify a valid JWT token", () => {
    const token = "valid-token";
    const secret = "test-secret";
    process.env.JWT_SECRET = secret;
    const mockDecoded = { userId: "user-123" };

    // Mock jwt.verify method
    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

    const decoded = verifyToken(token);

    expect(decoded).toEqual(mockDecoded);
    expect(jwt.verify).toHaveBeenCalledWith(token, secret);
  });

  it("should throw an error for invalid JWT token", () => {
    const token = "invalid-token";
    const secret = "test-secret";
    process.env.JWT_SECRET = secret;

    // Mock jwt.verify method to throw error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    expect(() => verifyToken(token)).toThrowError("Invalid token");
  });
});

// Test for getClientInfo function
describe("getClientInfo", () => {
  it("should extract client info from request", () => {
    const mockRequest = {
      headers: {
        "x-forwarded-for": "192.168.0.1",
        "user-agent": "Mozilla/5.0",
      },
      body: { location: new GeoPoint(37.7749, -122.4194) },
    };

    const clientInfo = getClientInfo(mockRequest as any);

    expect(clientInfo.ip).toBe("192.168.0.1");
    expect(clientInfo.userAgent).toBe("Mozilla/5.0");
    expect(clientInfo.deviceHash).toBeDefined();
    expect(clientInfo.location).toBeDefined();
  });
});

// Test for storeDevice function
describe("storeDevice", () => {
  it("should store device information in Firestore", async () => {
    const deviceHash = "device-123";
    const location = new GeoPoint(37.7749, -122.4194);
    const ip = "192.168.1.1";

    // Create mocks
    const setMock = jest.fn();
    const docMock = jest.fn(() => ({ set: setMock }));
    const collectionMock = jest.fn(() => ({ doc: docMock }));

    // Apply mocks to db
    (db.collection as jest.Mock).mockImplementation(collectionMock);

    // Call the function
    await storeDevice(deviceHash, location, ip);

    // Assertions
    expect(collectionMock).toHaveBeenCalledWith("devices");
    expect(docMock).toHaveBeenCalledWith(deviceHash);
    expect(setMock).toHaveBeenCalledWith({
      location,
      ip,
      updatedAt: expect.any(Number),
    });
  });
});

// Test for verifyLocation function
describe("verifyLocation", () => {
  it("should return true for matching location and IP", async () => {
    const deviceHash = "device-123";
    const location = new GeoPoint(37.7749, -122.4194);
    const ip = "192.168.1.1";

    const mockDocSnapshot = {
      exists: true,
      data: () => ({
        ip,
        location: new GeoPoint(37.7749, -122.4194),
      }),
    };

    (db.collection as jest.Mock).mockReturnValueOnce({
      doc: jest.fn().mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(mockDocSnapshot),
      }),
    });

    const result = await verifyLocation(deviceHash, location, ip);
    expect(result).toBe(true);
  });

  it("should return false for different location", async () => {
    const deviceHash = "device-123";
    const location = new GeoPoint(40.7128, -74.006); // Different location
    const ip = "192.168.1.1";

    const mockDocSnapshot = {
      exists: true,
      data: () => ({
        ip,
        location: new GeoPoint(37.7749, -122.4194), // Different location
      }),
    };

    (db.collection as jest.Mock).mockReturnValueOnce({
      doc: jest.fn().mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(mockDocSnapshot),
      }),
    });

    const result = await verifyLocation(deviceHash, location, ip);
    expect(result).toBe(false);
  });
});

describe("saveSession", () => {
  it("should save the session and return the sessionId", async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn(() => ({ set: mockSet }));
    const mockCollection = jest.fn(() => ({ doc: mockDoc }));

    (db.collection as jest.Mock).mockImplementation(mockCollection);

    const mockUserId = "user123";
    const mockData = {
      clientInfo: {
        ip: "127.0.0.1",
        userAgent: "test-agent",
        deviceHash: "hashed-device-id",
        location: { latitude: 0, longitude: 0 } as any,
      },
      token: "mock-token",
    };

    const result = await saveSession(mockUserId, mockData);

    expect(result).toBe("mock-session-id");
    expect(db.collection).toHaveBeenCalledWith("authSessions");
    expect(mockDoc).toHaveBeenCalledWith("mock-session-id");
    expect(mockSet).toHaveBeenCalledWith({
      ...mockData,
      userId: "user123",
      sessionId: "mock-session-id",
    });
  });
});

describe("auth utils", () => {
  const payload = { id: "user123" };
  const secret = "test-secret";
  const fakeToken = "fake.jwt.token";

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    jest.resetAllMocks();
  });

  describe("generateTokenMiddle", () => {
    it("should generate JWT token with payload and secret", () => {
      (jwt.sign as jest.Mock).mockReturnValue(fakeToken);

      const token = generateTokenMiddle(payload);

      expect(token).toBe(fakeToken);
      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, {
        expiresIn: "15m",
      });
    });

    it("should throw error if JWT_SECRET is not defined", () => {
      delete process.env.JWT_SECRET;

      expect(() => generateTokenMiddle(payload)).toThrow(
        "JWT_SECRET not defined"
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify token with JWT_SECRET", () => {
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const decoded = verifyToken(fakeToken);

      expect(decoded).toBe(payload);
      expect(jwt.verify).toHaveBeenCalledWith(fakeToken, secret);
    });
  });

  describe("getClientInfo", () => {
    it("should return correct client info from headers and body", () => {
      const request = {
        headers: {
          "x-forwarded-for": "1.2.3.4, 5.6.7.8",
          "user-agent": "Mozilla/5.0",
        },
        ip: "5.5.5.5",
        body: {
          location: { lat: 10, lng: 20 },
        },
      } as unknown as FastifyRequest;

      const result = getClientInfo(request);

      const expectedHash = crypto
        .createHash("sha256")
        .update("1.2.3.4|Mozilla/5.0")
        .digest("hex");

      expect(result).toEqual({
        ip: "1.2.3.4",
        userAgent: "Mozilla/5.0",
        deviceHash: expectedHash,
        location: { lat: 10, lng: 20 },
      });
    });

    it("should fallback to request.ip and user-agent 'unknown'", () => {
      const request = {
        headers: {},
        ip: "9.9.9.9",
        query: {
          location: { lat: 1, lng: 2 },
        },
      } as unknown as FastifyRequest;

      const result = getClientInfo(request);

      const expectedHash = crypto
        .createHash("sha256")
        .update("9.9.9.9|unknown")
        .digest("hex");

      expect(result).toEqual({
        ip: "9.9.9.9",
        userAgent: "unknown",
        deviceHash: expectedHash,
        location: { lat: 1, lng: 2 },
      });
    });
  });
});
