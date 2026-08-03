import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { CustomError } from '../utils/error.utils';
import { errorMiddleware } from './error.middleware';

describe('errorMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockReq = {};
    mockRes = { status: statusMock, json: jsonMock };
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('handles CustomError and returns correct status and JSON', () => {
    const err = new CustomError('Bad request', 400);
    const next = vi.fn();

    errorMiddleware(err, mockReq as Request, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Bad request',
      error: 'Bad request',
    });
  });

  it('handles Mongoose CastError and returns 404', () => {
    const err = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
    const next = vi.fn();

    errorMiddleware(err, mockReq as Request, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found',
      error: 'Resource not found',
    });
  });

  it('handles Mongoose duplicate key (11000) and returns 409 with friendly message', () => {
    const err = Object.assign(new Error('Duplicate'), {
      code: 11000,
      keyPattern: { storeId: 1, urlHandle: 1 },
      keyValue: { urlHandle: 'summer' },
    });
    const next = vi.fn();

    errorMiddleware(err, mockReq as Request, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'The URL handle "summer" is already in use. Choose a different URL handle.',
      error: 'The URL handle "summer" is already in use. Choose a different URL handle.',
    });
  });

  it('handles Mongoose ValidationError and returns 400', () => {
    const err = Object.assign(new Error('Validation failed'), {
      name: 'ValidationError',
      errors: {
        field1: { message: 'Field1 is required' },
        field2: { message: 'Field2 is invalid' },
      },
    });
    const next = vi.fn();

    errorMiddleware(err, mockReq as Request, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Field1 is required, Field2 is invalid',
      error: 'Field1 is required, Field2 is invalid',
    });
  });

  it('handles unknown error and returns 500', () => {
    const err = new Error('Unknown server error');
    const next = vi.fn();

    errorMiddleware(err, mockReq as Request, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Unknown server error',
      error: 'Unknown server error',
    });
  });
});
