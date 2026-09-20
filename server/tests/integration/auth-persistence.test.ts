import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes.js';
import { prisma } from '../../src/config/database.js';
import { errorHandler } from '../../src/middleware/error.middleware.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Authentication & Real DB Persistence Integration', () => {
  const testEmail = `persistence-test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Persistence Test User';
  let accessToken = '';

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it('Phase 4.1: Should register a new user in the database and exclude passwordHash', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.name).toBe(testName);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.accessToken).toBeDefined();

    // Verify user actually exists in the database query
    const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe(testEmail);
  });

  it('Phase 4.2: Should reject duplicate email registration with user-friendly error', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('An account with this email already exists.');
  });

  it('Phase 4.3: Should reject login with invalid password', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('Phase 4.4: Should successfully login registered user from database', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
  });

  it('Phase 4.5: Should retrieve current authenticated user via /api/auth/me', async () => {
    const res = await supertest(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.name).toBe(testName);
  });

  it('Phase 4.6: Should reject unauthenticated requests to /api/auth/me', async () => {
    const res = await supertest(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-sample');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
