process.env.ADMIN_WEBHOOK_URL = "https://dummy-webhook.com";

import { verifyLocationMiddleware } from '../../middleware/verifyLocationMiddleware';
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyLocation, getClientInfo } from '../../utils/auth';

// Mocking dependencies
jest.mock('../../utils/auth');
jest.mock("node-fetch", () => jest.fn());

// Sample mock data
const mockDeviceHash = 'device123';
const mockIp = '192.168.0.1';
const mockLocation = { country: 'US', city: 'New York' };

beforeAll(() => {
  globalThis.fetch = jest.fn();
});

describe('verifyLocationMiddleware', () => {
  let request: FastifyRequest;
  let reply: FastifyReply;

  beforeEach(() => {
    request = {
      headers: {},
      log: {
        warn: jest.fn(),
        error: jest.fn(),
      },
    } as unknown as FastifyRequest;

    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;
  });

  it('should allow trusted login (location verified)', async () => {
    (getClientInfo as jest.Mock).mockReturnValue({ deviceHash: mockDeviceHash, location: mockLocation, ip: mockIp });

    (verifyLocation as jest.Mock).mockResolvedValue(true);

    await verifyLocationMiddleware(request, reply);
    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it("should block suspicious login (untrusted location)", async () => {
    const req = {
      headers: {
        "user-agent": "Mozilla",
      },
      ip: "1.2.3.4",
      body: {
        location: { lat: 10, lng: 20 },
        trustedLocation: { lat: 0, lng: 0 }, // khác nhau để tạo suspicious
      },
    } as any;
  
    const reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;
  
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
  
    await verifyLocationMiddleware(req, reply);
  
    expect(fetchMock).toHaveBeenCalledWith(
      "https://dummy-webhook.com",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Suspicious login detected"),
      })
    );
  
    expect(reply.code).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      error: "Suspicious login",
    });
  });

  it('should handle errors gracefully and log them', async () => {
    (getClientInfo as jest.Mock).mockImplementation(() => { throw new Error('Client info error'); });

    await verifyLocationMiddleware(request, reply);

    // Ensure error is logged
    expect(request.log.error).toHaveBeenCalledWith('Error verifying location:', expect.any(Error));
  });
});
