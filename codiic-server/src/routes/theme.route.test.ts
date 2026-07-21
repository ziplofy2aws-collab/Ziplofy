import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { themeRouter } from './theme.route';
import { errorMiddleware } from '../middlewares/error.middleware';

vi.mock('../models/theme.model', () => ({
  Theme: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

import { Theme } from '../models/theme.model';

function mockThemeFindChain(result: unknown[]) {
  (Theme.find as ReturnType<typeof vi.fn>).mockReturnValue({
    populate: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue(result),
          }),
        }),
      }),
    }),
  });
}

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/themes', themeRouter);
  app.use(errorMiddleware);
  return app;
}

describe('theme routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/themes', () => {
    it('returns 200 and applies filter from query (public route)', async () => {
      mockThemeFindChain([]);
      (Theme.countDocuments as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      const app = createTestApp();
      const res = await request(app)
        .get('/api/themes')
        .query({ search: 'foo', page: '1', limit: '10' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Theme.find).toHaveBeenCalled();
    });

    it('returns paginated themes', async () => {
      const mockThemes = [{ _id: 't1', name: 'Theme 1' }];
      mockThemeFindChain(mockThemes);
      (Theme.countDocuments as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const app = createTestApp();
      const res = await request(app).get('/api/themes');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: 't1', name: 'Theme 1' })])
      );
      expect(res.body.total).toBe(1);
      expect(res.body.totalPages).toBe(1);
    });
  });
});
