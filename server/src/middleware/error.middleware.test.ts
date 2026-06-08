import { describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from './error.middleware';
import { CustomError } from '../utils/error.utils';

const createReq = (): Partial<Request> => ({});
const createRes = (): Partial<Response> => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('errorMiddleware', () => {
  it('handles CustomError with correct status and message', () => {
    const err = new CustomError('Bad request', 400);
    const req = createReq() as Request;
    const res = createRes() as Response;
    const next = vi.fn() as unknown as NextFunction;

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Bad request',
    });
  });

  it('handles JsonWebTokenError', () => {
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';
    const req = createReq() as Request;
    const res = createRes() as Response;

    errorMiddleware(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token. Please log in again.',
    });
  });

  it('handles TokenExpiredError', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    const req = createReq() as Request;
    const res = createRes() as Response;

    errorMiddleware(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired. Please log in again.',
    });
  });

  it('handles Mongoose CastError', () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';
    const req = createReq() as Request;
    const res = createRes() as Response;

    errorMiddleware(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles Mongoose duplicate key (11000)', () => {
    const err = new Error('E11000 duplicate key');
    (err as { code?: number }).code = 11000;
    (err as { keyValue?: Record<string, unknown> }).keyValue = { email: 'a@b.com' };
    const req = createReq() as Request;
    const res = createRes() as Response;

    errorMiddleware(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('falls back to 500 for unknown errors', () => {
    const err = new Error('Unknown error');
    const req = createReq() as Request;
    const res = createRes() as Response;

    errorMiddleware(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
