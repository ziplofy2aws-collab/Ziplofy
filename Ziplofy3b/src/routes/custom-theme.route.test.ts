import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { customThemeRouter } from './custom-theme.route';
import { errorMiddleware } from '../middlewares/error.middleware';
import { SUPER_ADMIN_TOKEN } from '../constants';

vi.mock('../models/custom-theme.model', () => ({
  CustomTheme: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

import { CustomTheme } from '../models/custom-theme.model';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/custom-themes', customThemeRouter);
  app.use(errorMiddleware);
  return app;
}

describe('custom-theme routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  describe('GET /api/custom-themes', () => {
    it('returns 401 without auth token', async () => {
      const app = createTestApp();
      const res = await request(app).get('/api/custom-themes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 with themes when valid token provided', async () => {
      const mockThemes = [
        {
          toObject: () => ({ _id: 't1', name: 'Theme 1', themePath: 'theme-1' }),
          thumbnail: null,
          themePath: 'theme-1',
        },
      ];
      (CustomTheme.find as ReturnType<typeof vi.fn>).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ sort: vi.fn().mockResolvedValue(mockThemes) }),
        }),
      });

      const app = createTestApp();
      const res = await request(app)
        .get('/api/custom-themes')
        .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
