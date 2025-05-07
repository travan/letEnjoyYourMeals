import { FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import { verifyLocation, getClientInfo } from '../utils/auth';

const ADMIN_WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL || ''; // set trong .env

async function notifyAdmin(deviceHash: string, ip: string, location: any) {
  if (!ADMIN_WEBHOOK_URL) return;

  const message = {
    content: `🚨 **Suspicious login detected**\n\n` +
      `- Device: \`${deviceHash}\`\n` +
      `- IP: \`${ip}\`\n` +
      `- Location: \`${JSON.stringify(location)}\`\n` +
      `- Time: ${new Date().toISOString()}`
  };

  try {
    await fetch(ADMIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.error('Failed to notify admin:', err);
  }
}

export async function verifyLocationMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { deviceHash, location, ip } = getClientInfo(request);

    const trusted = await verifyLocation(deviceHash, location, ip);
    if (!trusted) {
      request.log.warn(
        `[Suspicious Login] Device ${deviceHash} from new location or IP: ${ip}`
      );

      notifyAdmin(deviceHash, ip, location);

      return reply.status(403).send({ error: 'Suspicious login attempt.' });
    }
  } catch (error) {
    request.log.error('Error verifying location:', error);
  }
}


