import { describe, it, expect, vi } from 'vitest';
import { CustomError, asyncErrorHandler } from './error.utils';
import type { Request, Response, NextFunction } from 'express';

describe('CustomError', () => {
  it('creates error with default message and statusCode', () => {
    const err = new CustomError();
    expect(err.message).toBe('Interval Server Error');
    expect(err.statusCode).toBe(500);
  });

  it('creates error with custom message and statusCode', () => {
    const err = new CustomError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
  });

  it('is instance of Error', () => {
    const err = new CustomError('Test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CustomError);
  });
});

describe('asyncErrorHandler', () => {
  it('calls the handler and passes through when no error', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncErrorHandler(handler);
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('catches async errors and passes them to next', async () => {
    const testError = new Error('Async failure');
    const handler = vi.fn().mockRejectedValue(testError);
    const wrapped = asyncErrorHandler(handler);
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(testError);
  });
});
