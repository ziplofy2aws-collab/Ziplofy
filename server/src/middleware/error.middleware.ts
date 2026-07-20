import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/error.utils';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void | Response => {
  // Log error stack for debugging
  if (err && err.stack) {
    console.error(err.stack);
  } else {
    console.error(err);
  }

  // Default error object
  let error = { ...err };
  error.message = err.message || 'Server Error';

  // Handle custom CustomError
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Mongoose: Invalid ObjectId
  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  // Mongoose: Duplicate key error
  if (err.code === 11000) {
    const fields = err.keyValue ? Object.keys(err.keyValue).join(', ') : '';
    const message = fields
      ? `Duplicate field value entered for: ${fields}`
      : 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT: Invalid token
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token. Please log in again.', statusCode: 401 };
  }

  // JWT: Expired token
  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired. Please log in again.', statusCode: 401 };
  }

  // JWT: NotBeforeError
  if (err.name === 'NotBeforeError') {
    error = { message: 'Token not active. Please try again later.', statusCode: 401 };
  }

  // Express: Body parser error (invalid JSON)
  if (err.type === 'entity.parse.failed') {
    error = { message: 'Invalid JSON payload.', statusCode: 400 };
  }

  // CORS error (from cors middleware)
  if (err instanceof Error && err.message && err.message.includes('CORS')) {
    error = { message: err.message, statusCode: 403 };
  }

  // MongoDB: Network error
  if (err.name === 'MongoNetworkError') {
    error = { message: 'Database connection error.', statusCode: 503 };
  }

  // Handle missing environment variables
  if (err.message && err.message.includes('not defined in environment variables')) {
    error = { message: err.message, statusCode: 500 };
  }

  // Fallback for unknown errors
  const status = error.statusCode || 500;
  const message = error.message || 'Server Error';

  return res.status(status).json({
    success: false,
    error: message
  });
};
