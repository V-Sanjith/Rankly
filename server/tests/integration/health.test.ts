import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import healthRoutes from '../../src/routes/health.routes.js';

const app = express();
app.use('/api', healthRoutes);
app.get('/health', healthRoutes);

describe('Database Health Endpoint (/api/health)', () => {
  it('should return HTTP 200 with status ok and database connected', async () => {
    const res = await supertest(app).get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      database: 'connected',
    });
  });

  it('should support top-level /health route returning database status', async () => {
    const res = await supertest(app).get('/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      database: 'connected',
    });
  });
});
