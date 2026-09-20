import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes.js';
import { errorHandler } from '../../src/middleware/error.middleware.js';
import { prisma } from '../../src/config/database.js';
import * as argon2 from 'argon2';
import * as jose from 'jose';

// Mock dependencies
vi.mock('../../src/config/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  }
}));

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed'),
    verify: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashed'),
  verify: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../src/config/env.js', () => ({
  env: { JWT_SECRET: 'test_secret', NODE_ENV: 'test' }
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('creates user and returns tokens', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'u1',
        name: 'Test',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'USER',
        status: 'ACTIVE'
      } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password@123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('rejects duplicate email', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns tokens for valid credentials', async () => {
      vi.mocked(argon2.verify).mockResolvedValue(true as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        status: 'ACTIVE'
      } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('rejects invalid password', async () => {
      vi.mocked(argon2.verify).mockResolvedValue(false as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        status: 'ACTIVE'
      } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');
      
      expect(response.status).toBe(401);
    });

    it('returns profile with valid token', async () => {
      const secret = new TextEncoder().encode('test_secret');
      const token = await new jose.SignJWT({ userId: 'u1' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);

      vi.mocked(prisma.user.findUnique).mockImplementation(async (args) => {
        if (args.where.id === 'u1') {
          return { id: 'u1', name: 'Test', email: 'test@example.com', status: 'ACTIVE' } as any;
        }
        return null;
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test');
    });
  });
});
