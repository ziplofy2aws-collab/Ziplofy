import { describe, expect, it, vi } from 'vitest';
import { CustomError, asyncErrorHandler } from './error.utils';
import type { Request, Response, NextFunction } from 'express';

describe('CustomError', () => {
  it('creates error with message and statusCode', () => {
    const err = new CustomError('Bad request', 400);
    expect(err.message).toBe('Bad request');
    expect(err.statusCode).toBe(400);
  });

  it('uses default message and 500 when not provided', () => {
    const err = new CustomError();
    expect(err.message).toBe('Interval Server Error');
    expect(err.statusCode).toBe(500);
  });

  it('is instanceof Error', () => {
    const err = new CustomError('Test', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CustomError);
  });
});

describe('asyncErrorHandler', () => {
  it('passes through successful handler result', async () => {
    const handler = asyncErrorHandler(async (req, res) => {
      res.status(200).json({ ok: true });
    });
    const req = {} as Request;
    const res = {
      status: (code: number) => ({ json: (body: unknown) => ({ code, body }) }),
    } as unknown as Response;
    const next = () => {};
    await handler(req, res, next);
  });

  it('calls next with error when handler throws', async () => {
    const err = new Error('handler threw');
    const handler = asyncErrorHandler(async () => {
      throw err;
    });
    const req = {} as Request;
    const res = {} as Response;
    const nextSpy = vi.fn();
    const next = nextSpy as unknown as NextFunction;
    await handler(req, res, next);
    expect(nextSpy).toHaveBeenCalledWith(err);
  });
});
