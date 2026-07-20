import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import { getThemes } from './theme.controller';

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

describe('theme.controller - getThemes', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = { query: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it('builds filter from query and returns paginated result', async () => {
    const mockThemes = [{ _id: 't1', name: 'Theme 1' }];
    mockThemeFindChain(mockThemes);
    (Theme.countDocuments as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    (mockReq as any).query = { page: '1', limit: '10', search: 'foo', category: 'ecommerce' };

    await getThemes(mockReq as Request, mockRes as Response, mockNext);

    expect(Theme.find).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: true,
        $text: { $search: 'foo' },
        category: 'ecommerce',
      })
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([expect.objectContaining({ _id: 't1', name: 'Theme 1' })]),
        totalPages: 1,
        currentPage: 1,
        total: 1,
      })
    );
  });

  it('uses default pagination when query is empty', async () => {
    mockThemeFindChain([]);
    (Theme.countDocuments as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    await getThemes(mockReq as Request, mockRes as Response, mockNext);

    expect(Theme.find).toHaveBeenCalledWith({ isActive: true });
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [],
        total: 0,
      })
    );
  });
});
