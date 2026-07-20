import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app';

describe('GET /api/health', () => {
  it('returns 200 with status, timestamp, uptime', async () => {
    const res = await request(app).get('/api/health').expect(200);

    expect(res.body.status).toBe('ok -updated');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });
});
