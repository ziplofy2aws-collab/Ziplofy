"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const error_utils_1 = require("../utils/error.utils");
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    // Default error
    let error = { ...err };
    error.message = err.message;
    // Handle custom CustomError
    if (err instanceof error_utils_1.CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = { message, statusCode: 400 };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};
exports.errorMiddleware = errorMiddleware;
