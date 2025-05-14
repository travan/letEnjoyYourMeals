import Fastify from 'fastify';
import supertest from 'supertest';
import { uploadRoutes } from '../../routes/upload'; // Adjust this path to your actual file
import { bucket } from '../../utils/firebase';
import fs from 'fs';
import path from 'path';

// Mock Firebase bucket and fs
jest.mock('../../utils/firebase');
jest.mock('fs');

describe('Upload Route', () => {
  const fastify = Fastify();

  // Register the upload routes before running the tests
  beforeAll(async () => {
    await fastify.register(uploadRoutes);
    await fastify.ready();
  });

  afterAll(() => fastify.close());

  it('POST /upload - upload file and return public URL', async () => {
    const mockFileName = 'test-file.jpg';
    const mockTempPath = path.join(__dirname, '../../uploads/mock-temp');

    const fsWriteStream = { write: jest.fn(), end: jest.fn(), on: jest.fn((_, cb) => cb()) };
    (fs.createWriteStream as jest.Mock).mockReturnValue(fsWriteStream);

    const mockUpload = jest.fn().mockResolvedValueOnce([{ name: 'test-file.jpg' }]);
    const mockMakePublic = jest.fn().mockResolvedValueOnce(undefined);
    const mockFile = jest.fn().mockReturnValue({ makePublic: mockMakePublic });

    (bucket.upload as jest.Mock).mockImplementation(mockUpload);
    (bucket.file as jest.Mock).mockImplementation(mockFile);

    const fileBuffer = Buffer.from('fake content');

    const res = await supertest(fastify.server)
      .post('/upload')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', fileBuffer, mockFileName);

    console.log('Response:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('https://storage.googleapis.com/');
    // expect(mockUpload).toHaveBeenCalled();
    // expect(mockMakePublic).toHaveBeenCalled();
  });

  it('POST /upload - no file uploaded', async () => {
    const res = await supertest(fastify.server).post('/upload');
    console.log('Error Response:', res.body); // Log error response
    expect(res.status).toBe(406);
    // expect(res.body.error).toBe('No file uploaded');
  });
});
