"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncErrorHandler = exports.CustomError = void 0;
// Custom Error Class
class CustomError extends Error {
    constructor(message = 'Interval Server Error', statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.CustomError = CustomError;
// Async wrapper to catch errors and pass them to error handler
const asyncErrorHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
exports.asyncErrorHandler = asyncErrorHandler;
