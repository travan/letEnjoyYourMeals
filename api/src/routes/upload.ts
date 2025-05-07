import { FastifyInstance, FastifyRequest } from 'fastify';
import { bucket } from '../utils/firebase';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import util from 'util';
import { MultipartFile } from '@fastify/multipart';

const pump = util.promisify(require('stream').pipeline);

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.register(require('@fastify/multipart'));

  fastify.post('/upload', async function (req: FastifyRequest<{ Body: MultipartFile }>, reply) {
    const file = await req.file();

    if (!file) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const fileId = `${Date.now()}-${randomUUID()}-${file.filename}`;
    const tempPath = path.join(__dirname, '../../uploads', fileId);

    await pump(file.file, fs.createWriteStream(tempPath));

    const check = await bucket.upload(tempPath, {
      destination: `uploads/${fileId}`,
      metadata: { contentType: file.mimetype },
    });

    const uploadedFile = bucket.file(`uploads/${fileId}`);
    await uploadedFile.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileId}`;

    return reply.send({
      message: 'Uploaded to Firebase',
      url: publicUrl,
    });
  });
  
}
