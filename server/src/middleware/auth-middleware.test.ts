import { describe, expect, it, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { protect } from './auth-middleware';
import type { Request, Response, NextFunction } from 'express';

const { User } = vi.hoisted(() => ({
  User: { findById: vi.fn() },
}));

vi.mock('../models/user', () => ({ User }));

const createReq = (authHeader?: string): Partial<Request> => ({
  headers: authHeader ? { authorization: authHeader } : {},
  user: undefined,
});

const createRes = (): Partial<Response> => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('protect middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  it('calls next with 401 when no Authorization header', async () => {
    const req = createReq() as Request;
    const res = createRes() as Response;
    const nextSpy = vi.fn();
    const next = nextSpy as unknown as NextFunction;

    await (protect as (a: Request, b: Response, c: NextFunction) => Promise<void>)(req, res, next);

    expect(nextSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Authorization required' })
    );
  });

  it('calls next with 401 when token is invalid', async () => {
    const req = createReq('Bearer invalid-token') as Request;
    const res = createRes() as Response;
    const nextSpy = vi.fn();
    const next = nextSpy as unknown as NextFunction;

    await (protect as (a: Request, b: Response, c: NextFunction) => Promise<void>)(req, res, next);

    expect(nextSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it('attaches user to req and calls next when token is valid', async () => {
    const token = jwt.sign(
      { uid: 'user-123', role: 'client', email: 'a@b.com' },
      'test-secret',
      { expiresIn: '1h' }
    );
    User.findById.mockResolvedValue({
      _id: { toString: () => 'user-123' },
      email: 'a@b.com',
      name: 'User',
      assignedSupportDeveloperId: null,
    });

    const req = createReq(`Bearer ${token}`) as Request & { user?: unknown };
    const res = createRes() as Response;
    const nextSpy = vi.fn();
    const next = nextSpy as unknown as NextFunction;

    await (protect as (a: Request, b: Response, c: NextFunction) => Promise<void>)(req, res, next);

    expect(nextSpy).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
  });
});
