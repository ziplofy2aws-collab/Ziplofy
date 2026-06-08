"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const error_utils_1 = require("../utils/error.utils");
const error_middleware_1 = require("./error.middleware");
(0, vitest_1.describe)('errorMiddleware', () => {
    let mockReq;
    let mockRes;
    let jsonMock;
    let statusMock;
    (0, vitest_1.beforeEach)(() => {
        jsonMock = vitest_1.vi.fn().mockReturnThis();
        statusMock = vitest_1.vi.fn().mockReturnValue({ json: jsonMock });
        mockReq = {};
        mockRes = { status: statusMock, json: jsonMock };
        vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
    });
    (0, vitest_1.it)('handles CustomError and returns correct status and JSON', () => {
        const err = new error_utils_1.CustomError('Bad request', 400);
        const next = vitest_1.vi.fn();
        (0, error_middleware_1.errorMiddleware)(err, mockReq, mockRes, next);
        (0, vitest_1.expect)(statusMock).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: 'Bad request',
        });
    });
    (0, vitest_1.it)('handles Mongoose CastError and returns 404', () => {
        const err = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
        const next = vitest_1.vi.fn();
        (0, error_middleware_1.errorMiddleware)(err, mockReq, mockRes, next);
        (0, vitest_1.expect)(statusMock).toHaveBeenCalledWith(404);
        (0, vitest_1.expect)(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: 'Resource not found',
        });
    });
    (0, vitest_1.it)('handles Mongoose duplicate key (11000) and returns 400', () => {
        const err = Object.assign(new Error('Duplicate'), { code: 11000 });
        const next = vitest_1.vi.fn();
        (0, error_middleware_1.errorMiddleware)(err, mockReq, mockRes, next);
        (0, vitest_1.expect)(statusMock).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: 'Duplicate field value entered',
        });
    });
    (0, vitest_1.it)('handles Mongoose ValidationError and returns 400', () => {
        const err = Object.assign(new Error('Validation failed'), {
            name: 'ValidationError',
            errors: {
                field1: { message: 'Field1 is required' },
                field2: { message: 'Field2 is invalid' },
            },
        });
        const next = vitest_1.vi.fn();
        (0, error_middleware_1.errorMiddleware)(err, mockReq, mockRes, next);
        (0, vitest_1.expect)(statusMock).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: 'Field1 is required, Field2 is invalid',
        });
    });
    (0, vitest_1.it)('handles unknown error and returns 500', () => {
        const err = new Error('Unknown server error');
        const next = vitest_1.vi.fn();
        (0, error_middleware_1.errorMiddleware)(err, mockReq, mockRes, next);
        (0, vitest_1.expect)(statusMock).toHaveBeenCalledWith(500);
        (0, vitest_1.expect)(jsonMock).toHaveBeenCalledWith({
            success: false,
            error: 'Unknown server error',
        });
    });
});
