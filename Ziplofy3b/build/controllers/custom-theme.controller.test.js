"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const custom_theme_controller_1 = require("./custom-theme.controller");
const error_utils_1 = require("../utils/error.utils");
vitest_1.vi.mock('../models/custom-theme.model', () => ({
    CustomTheme: {
        find: vitest_1.vi.fn(),
        findOne: vitest_1.vi.fn(),
        findById: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
    },
}));
const custom_theme_model_1 = require("../models/custom-theme.model");
(0, vitest_1.describe)('custom-theme.controller', () => {
    let mockReq;
    let mockRes;
    let next;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        next = vitest_1.vi.fn();
        mockReq = { body: {}, params: {}, files: undefined };
        mockRes = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
    });
    (0, vitest_1.describe)('createCustomTheme', () => {
        (0, vitest_1.it)('calls next with 400 when name is missing', async () => {
            mockReq.body = {};
            mockReq.files = { zipFile: [{ path: '/tmp/x', originalname: 'a.zip', size: 100 }] };
            mockReq.user = { id: 'user123' };
            await (0, custom_theme_controller_1.createCustomTheme)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.message).toBe('Name is required');
            (0, vitest_1.expect)(err.statusCode).toBe(400);
        });
        (0, vitest_1.it)('calls next with 400 when zip is missing', async () => {
            mockReq.body = { name: 'My Theme' };
            mockReq.files = {};
            mockReq.user = { id: 'user123' };
            await (0, custom_theme_controller_1.createCustomTheme)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.message).toBe('ZIP file is required');
            (0, vitest_1.expect)(err.statusCode).toBe(400);
        });
        (0, vitest_1.it)('calls next with 401 when no user', async () => {
            mockReq.body = { name: 'My Theme' };
            mockReq.files = { zipFile: [{ path: '/tmp/x', originalname: 'a.zip', size: 100 }] };
            mockReq.user = undefined;
            await (0, custom_theme_controller_1.createCustomTheme)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.message).toBe('User authentication required');
            (0, vitest_1.expect)(err.statusCode).toBe(401);
        });
    });
    (0, vitest_1.describe)('getCustomThemes', () => {
        (0, vitest_1.it)('calls next with 401 when no user', async () => {
            mockReq.user = undefined;
            await (0, custom_theme_controller_1.getCustomThemes)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.message).toBe('User authentication required');
            (0, vitest_1.expect)(err.statusCode).toBe(401);
        });
        (0, vitest_1.it)('returns 200 with themes when user is authenticated', async () => {
            mockReq.user = { id: '507f1f77bcf86cd799439011' };
            const mockThemes = [
                {
                    toObject: () => ({ _id: 't1', name: 'Theme 1', themePath: 'theme-1' }),
                    thumbnail: null,
                    themePath: 'theme-1',
                },
            ];
            custom_theme_model_1.CustomTheme.find.mockReturnValue({
                populate: vitest_1.vi.fn().mockReturnValue({
                    select: vitest_1.vi.fn().mockReturnValue({ sort: vitest_1.vi.fn().mockResolvedValue(mockThemes) }),
                }),
            });
            mockReq.protocol = 'http';
            mockReq.get = vitest_1.vi.fn().mockReturnValue('localhost:5000');
            await (0, custom_theme_controller_1.getCustomThemes)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).not.toHaveBeenCalled();
            (0, vitest_1.expect)(mockRes.status).toHaveBeenCalledWith(200);
            (0, vitest_1.expect)(mockRes.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                success: true,
                data: vitest_1.expect.any(Array),
                count: 1,
            }));
        });
    });
    (0, vitest_1.describe)('getCustomTheme', () => {
        (0, vitest_1.it)('calls next with 400 for invalid ObjectId', async () => {
            mockReq.params = { id: 'invalid-id' };
            mockReq.user = { id: 'user123' };
            await (0, custom_theme_controller_1.getCustomTheme)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.message).toContain('Invalid theme ID format');
            (0, vitest_1.expect)(err.statusCode).toBe(400);
        });
        (0, vitest_1.it)('calls next with 401 when no user', async () => {
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockReq.user = undefined;
            await (0, custom_theme_controller_1.getCustomTheme)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.message).toBe('User authentication required');
            (0, vitest_1.expect)(err.statusCode).toBe(401);
        });
        (0, vitest_1.it)('calls next with 404 when theme not found', async () => {
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockReq.user = { id: '507f1f77bcf86cd799439011' };
            custom_theme_model_1.CustomTheme.findOne.mockReturnValue({
                populate: () => Promise.resolve(null),
            });
            await (0, custom_theme_controller_1.getCustomTheme)(mockReq, mockRes, next);
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
            const err = next.mock.calls[0][0];
            (0, vitest_1.expect)(err.statusCode).toBe(404);
            (0, vitest_1.expect)(err.message).toMatch(/not found|don't have permission/);
        });
    });
});
