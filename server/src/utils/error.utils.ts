import { NextFunction, Request, Response } from 'express';

// Custom Error Class
export class CustomError extends Error {
    constructor(message: string = 'Interval Server Error', public statusCode: number = 500) {
        super(message);
    }
}

// Async wrapper to catch errors and pass them to error handler
export const asyncErrorHandler = (
func: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response>
) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await func(req, res, next);
  } catch (error) {
    next(error);
  }
};
