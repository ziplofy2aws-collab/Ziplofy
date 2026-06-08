import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  createCustomTheme,
  getCustomThemes,
  getCustomTheme,
} from './custom-theme.controller';
import { CustomError } from '../utils/error.utils';

vi.mock('../models/custom-theme.model', () => ({
  CustomTheme: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

import { CustomTheme } from '../models/custom-theme.model';

describe('custom-theme.controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
    mockReq = { body: {}, params: {}, files: undefined };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('createCustomTheme', () => {
    it('calls next with 400 when name is missing', async () => {
      (mockReq as any).body = {};
      (mockReq as any).files = { zipFile: [{ path: '/tmp/x', originalname: 'a.zip', size: 100 }] };
      (mockReq as any).user = { id: 'user123' };

      await createCustomTheme(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toBe('Name is required');
      expect(err.statusCode).toBe(400);
    });

    it('calls next with 400 when zip is missing', async () => {
      (mockReq as any).body = { name: 'My Theme' };
      (mockReq as any).files = {};
      (mockReq as any).user = { id: 'user123' };

      await createCustomTheme(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toBe('ZIP file is required');
      expect(err.statusCode).toBe(400);
    });

    it('calls next with 401 when no user', async () => {
      (mockReq as any).body = { name: 'My Theme' };
      (mockReq as any).files = { zipFile: [{ path: '/tmp/x', originalname: 'a.zip', size: 100 }] };
      (mockReq as any).user = undefined;

      await createCustomTheme(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toBe('User authentication required');
      expect(err.statusCode).toBe(401);
    });
  });

  describe('getCustomThemes', () => {
    it('calls next with 401 when no user', async () => {
      (mockReq as any).user = undefined;

      await getCustomThemes(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toBe('User authentication required');
      expect(err.statusCode).toBe(401);
    });

    it('returns 200 with themes when user is authenticated', async () => {
      (mockReq as any).user = { id: '507f1f77bcf86cd799439011' };
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
      (mockReq as any).protocol = 'http';
      (mockReq as any).get = vi.fn().mockReturnValue('localhost:5000');

      await getCustomThemes(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          count: 1,
        })
      );
    });
  });

  describe('getCustomTheme', () => {
    it('calls next with 400 for invalid ObjectId', async () => {
      (mockReq as any).params = { id: 'invalid-id' };
      (mockReq as any).user = { id: 'user123' };

      await getCustomTheme(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toContain('Invalid theme ID format');
      expect(err.statusCode).toBe(400);
    });

    it('calls next with 401 when no user', async () => {
      (mockReq as any).params = { id: '507f1f77bcf86cd799439011' };
      (mockReq as any).user = undefined;

      await getCustomTheme(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toBe('User authentication required');
      expect(err.statusCode).toBe(401);
    });

    it('calls next with 404 when theme not found', async () => {
      (mockReq as any).params = { id: '507f1f77bcf86cd799439011' };
      (mockReq as any).user = { id: '507f1f77bcf86cd799439011' };
      (CustomTheme.findOne as ReturnType<typeof vi.fn>).mockReturnValue({
        populate: () => Promise.resolve(null),
      });

      await getCustomTheme(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const err = (next as any).mock.calls[0][0];
      expect(err.statusCode).toBe(404);
      expect(err.message).toMatch(/not found|don't have permission/);
    });
  });
});
