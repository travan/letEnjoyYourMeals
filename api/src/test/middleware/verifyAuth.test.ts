import { authMiddleware } from "../../middleware/verifyAuth";
import { verifyToken } from "../../utils/auth";
import { db } from "../../utils/firebase";

const getMock = jest.fn();

jest.mock("../../utils/auth", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("../../utils/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: getMock, // <-- gán từ biến bên ngoài
        })),
      })),
    })),
  },
}));

describe("authMiddleware", () => {
  const reply = {
    code: jest.fn().mockReturnThis(),
    send: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing", async () => {
    const request: any = { cookies: {} };
    await authMiddleware(request, reply as any);
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Missing auth token in cookie",
    });
  });

  it("should return 401 if token is invalid", async () => {
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });
    const request: any = { cookies: { token: "invalid" } };
    await authMiddleware(request, reply as any);
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
  });

  it("should return 401 if session not found", async () => {
    (verifyToken as jest.Mock).mockReturnValue({ device: "abc" });
    getMock.mockResolvedValue({ empty: true });
    const request: any = { cookies: { token: "valid" } };
    await authMiddleware(request, reply as any);
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "Session not found" });
  });

  it("should attach user to request if session exists", async () => {
    (verifyToken as jest.Mock).mockReturnValue({ device: "abc" });

    const mockData = {
      clientInfo: {
        deviceHash: "hash123",
        ip: "1.2.3.4",
        userAgent: "Mozilla",
      },
    };

    getMock.mockResolvedValue({
      empty: false,
      docs: [{ data: () => mockData }],
    });

    const request: any = { cookies: { token: "valid" } };
    await authMiddleware(request, reply as any);

    expect(request.user).toEqual({
      deviceHash: "hash123",
      ip: "1.2.3.4",
      userAgent: "Mozilla",
    });

    expect(reply.code).not.toHaveBeenCalled();
  });
});
