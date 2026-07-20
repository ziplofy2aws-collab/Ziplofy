import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { protect, authorize } from './auth.middleware';
import { SUPER_ADMIN_TOKEN } from '../constants';

function createUserFindByIdChain(mockResult: any) {
  return {
    select: vi.fn().mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockResult),
    }),
  };
}

vi.mock('../models/user.model', () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';

describe('protect', () => {
  let mockReq: Partial<Request> & { user?: any; headers?: Record<string, string> };
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = { headers: {} };
    mockRes = {};
    next = vi.fn();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  it('returns 401 when no token provided', async () => {
    mockReq.headers = {};

    await (protect as any)(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 })
    );
  });

  it('returns 401 when Authorization header has no Bearer prefix', async () => {
    mockReq.headers = { authorization: 'Basic xxx' };

    await (protect as any)(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 })
    );
  });

  it('sets req.user when SUPER_ADMIN_TOKEN is provided', async () => {
    mockReq.headers = { authorization: `Bearer ${SUPER_ADMIN_TOKEN}` };

    await (protect as any)(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.role).toBe('super-admin');
    expect(mockReq.user?.superAdmin).toBe(true);
  });

  it('sets req.user when valid JWT and user found in database', async () => {
    const decoded = { uid: 'user123', email: 'test@example.com', role: 'client-admin' };
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue(decoded);

    const mockUser = {
      _id: { toString: () => 'user123' },
      name: 'Test User',
      email: 'test@example.com',
      role: { name: 'client-admin', isSuperAdmin: false, _id: { toString: () => 'role1' } },
      assignedSupportDeveloperId: null,
    };
    (User.findById as ReturnType<typeof vi.fn>).mockReturnValue(createUserFindByIdChain(mockUser));

    mockReq.headers = { authorization: 'Bearer valid-jwt-token' };

    await (protect as any)(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.id).toBe('user123');
    expect(mockReq.user?.email).toBe('test@example.com');
  });

  it('returns 401 when JWT verification fails', async () => {
    (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    mockReq.headers = { authorization: 'Bearer invalid-token' };

    await (protect as any)(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 })
    );
  });
});

describe('authorize', () => {
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {};
    mockRes = {};
    next = vi.fn();
  });

  it('returns 401 when no user in request', () => {
    const middleware = authorize('admin', 'super-admin');
    middleware(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 })
    );
  });

  it('allows super admin regardless of required roles', () => {
    mockReq.user = { role: 'super-admin', superAdmin: true };
    const middleware = authorize('admin');
    middleware(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('returns 403 when user role is not in allowed roles', () => {
    mockReq.user = { role: 'client', superAdmin: false };
    const middleware = authorize('super-admin', 'support-admin');
    middleware(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Role client is not authorized to access this route',
        statusCode: 403,
      })
    );
  });

  it('allows when user role is in allowed roles', () => {
    mockReq.user = { role: 'support-admin', superAdmin: false };
    const middleware = authorize('super-admin', 'support-admin');
    middleware(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith();
  });
});
