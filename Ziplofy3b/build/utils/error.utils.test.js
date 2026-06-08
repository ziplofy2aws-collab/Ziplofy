"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const error_utils_1 = require("./error.utils");
(0, vitest_1.describe)('CustomError', () => {
    (0, vitest_1.it)('creates error with default message and statusCode', () => {
        const err = new error_utils_1.CustomError();
        (0, vitest_1.expect)(err.message).toBe('Interval Server Error');
        (0, vitest_1.expect)(err.statusCode).toBe(500);
    });
    (0, vitest_1.it)('creates error with custom message and statusCode', () => {
        const err = new error_utils_1.CustomError('Not found', 404);
        (0, vitest_1.expect)(err.message).toBe('Not found');
        (0, vitest_1.expect)(err.statusCode).toBe(404);
    });
    (0, vitest_1.it)('is instance of Error', () => {
        const err = new error_utils_1.CustomError('Test');
        (0, vitest_1.expect)(err).toBeInstanceOf(Error);
        (0, vitest_1.expect)(err).toBeInstanceOf(error_utils_1.CustomError);
    });
});
(0, vitest_1.describe)('asyncErrorHandler', () => {
    (0, vitest_1.it)('calls the handler and passes through when no error', async () => {
        const handler = vitest_1.vi.fn().mockResolvedValue(undefined);
        const wrapped = (0, error_utils_1.asyncErrorHandler)(handler);
        const req = {};
        const res = {};
        const next = vitest_1.vi.fn();
        await wrapped(req, res, next);
        (0, vitest_1.expect)(handler).toHaveBeenCalledWith(req, res, next);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('catches async errors and passes them to next', async () => {
        const testError = new Error('Async failure');
        const handler = vitest_1.vi.fn().mockRejectedValue(testError);
        const wrapped = (0, error_utils_1.asyncErrorHandler)(handler);
        const req = {};
        const res = {};
        const next = vitest_1.vi.fn();
        await wrapped(req, res, next);
        (0, vitest_1.expect)(handler).toHaveBeenCalled();
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(testError);
    });
});
