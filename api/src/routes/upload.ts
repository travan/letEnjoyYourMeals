import { FastifyInstance, FastifyRequest } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY!;
const MAX_BASE64_SIZE = 8 * 1024 * 1024;

async function compressImageBuffer(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

async function uploadToImgBBBase64(base64Image: string, apiKey: string) {
  const form = new FormData();
  form.append("key", apiKey);
  form.append("image", base64Image);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.data;
}

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.register(require("@fastify/multipart"), {
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
  });

  fastify.post(
    "/upload",
    async function (req: FastifyRequest<{ Body: MultipartFile }>, reply) {
      const file = await req.file();
      if (!file) return reply.code(400).send({ error: "No file uploaded" });
      if (!file.mimetype.startsWith("image/")) {
        return reply.code(400).send({ error: "File is not an image" });
      }

      try {
        const originalBuffer = await file.toBuffer();

        const compressedBuffer = await compressImageBuffer(originalBuffer);

        if (compressedBuffer.length <= MAX_BASE64_SIZE) {
          const base64 = compressedBuffer.toString("base64");
          const result = await uploadToImgBBBase64(base64, IMGBB_API_KEY);

          return reply.send({
            message: "Uploaded to ImgBB",
            url: result.url,
            deleteUrl: result.delete_url,
          });
        } else {
          const stream = require("stream");
          const bufferStream = new stream.PassThrough();
          bufferStream.end(compressedBuffer);

          const form = new FormData();
          form.append("key", IMGBB_API_KEY);
          form.append("image", bufferStream);

          const res = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          });

          const data = await res.json();

          if (!data.success) {
            throw new Error(data.error?.message || "Upload failed");
          }

          return reply.send({
            message: "Uploaded to ImgBB",
            url: data.data.url,
            deleteUrl: data.data.delete_url,
          });
        }
      } catch (err: any) {
        return reply.code(500).send({ error: err.message || "Upload failed" });
      }
    }
  );
}
