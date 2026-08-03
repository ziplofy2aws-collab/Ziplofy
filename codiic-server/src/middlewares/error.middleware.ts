import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/error.utils';

function humanizeDuplicateKey(err: any): string {
  const keyPattern = err?.keyPattern && typeof err.keyPattern === 'object' ? err.keyPattern : null;
  const keyValue = err?.keyValue && typeof err.keyValue === 'object' ? err.keyValue : null;
  const fields = keyPattern ? Object.keys(keyPattern) : keyValue ? Object.keys(keyValue) : [];

  if (fields.includes('urlHandle')) {
    const handle = keyValue?.urlHandle;
    return typeof handle === 'string' && handle.trim()
      ? `The URL handle "${handle}" is already in use. Choose a different URL handle.`
      : 'This URL handle is already in use. Choose a different URL handle.';
  }

  if (fields.length === 1) {
    const field = fields[0];
    const value = keyValue?.[field];
    if (typeof value === 'string' && value.trim()) {
      return `A record with ${field} "${value}" already exists.`;
    }
    return `A record with this ${field} already exists.`;
  }

  if (fields.length > 1) {
    return `A record with these values already exists (${fields.join(', ')}).`;
  }

  return 'This value is already in use. Please choose a different one.';
}

function sendError(
  res: Response,
  statusCode: number,
  message: string
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    error: message,
  });
}

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void | Response => {
  console.error(err.stack);

  if (err instanceof CustomError) {
    return sendError(res, err.statusCode, err.message);
  }

  if (err.name === 'CastError') {
    return sendError(res, 404, 'Resource not found');
  }

  if (err.code === 11000) {
    return sendError(res, 409, humanizeDuplicateKey(err));
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((val: any) => val?.message)
      .filter(Boolean)
      .join(', ');
    return sendError(res, 400, message || 'Validation failed');
  }

  return sendError(res, err.statusCode || 500, err.message || 'Server Error');
};
