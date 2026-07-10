"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_controller_1 = require("./auth.controller");
const error_utils_1 = require("../utils/error.utils");
vitest_1.vi.mock('bcryptjs', () => ({
    default: {
        compare: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vitest_1.vi.fn(() => 'mock-jwt-token'),
    },
}));
vitest_1.vi.mock('../models/user.model', () => ({
    User: {
        findOne: vitest_1.vi.fn(),
        findById: vitest_1.vi.fn(),
    },
}));
function createUserQuery(mockResult) {
    return {
        select: vitest_1.vi.fn().mockResolvedValue(mockResult),
    };
}
vitest_1.vi.mock('../models/role.model', () => ({
    Role: {
        findById: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('../utils/email.utils', () => ({
    sendEmail: vitest_1.vi.fn(),
}));
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, vitest_1.describe)('auth.controller - adminLogin', () => {
    let mockReq;
    let mockRes;
    let next;
    let jsonMock;
    let statusMock;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        jsonMock = vitest_1.vi.fn();
        statusMock = vitest_1.vi.fn().mockReturnValue({ json: jsonMock });
        next = vitest_1.vi.fn();
        mockReq = { body: {} };
        mockRes = { status: statusMock };
        process.env.ACCESS_TOKEN_SECRET = 'test-secret';
    });
    (0, vitest_1.it)('calls next with 400 when email is missing', async () => {
        mockReq.body = { password: 'pass123' };
        await (0, auth_controller_1.adminLogin)(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
        const err = next.mock.calls[0][0];
        (0, vitest_1.expect)(err.message).toBe('Please provide email and password');
        (0, vitest_1.expect)(err.statusCode).toBe(400);
    });
    (0, vitest_1.it)('calls next with 400 when password is missing', async () => {
        mockReq.body = { email: 'test@example.com' };
        await (0, auth_controller_1.adminLogin)(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
        const err = next.mock.calls[0][0];
        (0, vitest_1.expect)(err.message).toBe('Please provide email and password');
        (0, vitest_1.expect)(err.statusCode).toBe(400);
    });
    (0, vitest_1.it)('calls next with 401 when user not found', async () => {
        mockReq.body = { email: 'unknown@example.com', password: 'pass123' };
        user_model_1.User.findOne.mockReturnValue(createUserQuery(null));
        await (0, auth_controller_1.adminLogin)(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
        const err = next.mock.calls[0][0];
        (0, vitest_1.expect)(err.message).toBe('Invalid credentials');
        (0, vitest_1.expect)(err.statusCode).toBe(401);
    });
    (0, vitest_1.it)('calls next with 401 when password does not match', async () => {
        const mockUser = {
            _id: { toString: () => 'user1' },
            email: 'test@example.com',
            name: 'Test',
            password: 'hashed',
            role: 'role1',
            status: 'active',
            lastLogin: null,
            save: vitest_1.vi.fn(),
        };
        mockReq.body = { email: 'test@example.com', password: 'wrongpass' };
        user_model_1.User.findOne.mockReturnValue(createUserQuery(mockUser));
        role_model_1.Role.findById.mockResolvedValue({ name: 'client-admin', isSuperAdmin: false });
        bcryptjs_1.default.compare.mockResolvedValue(false);
        await (0, auth_controller_1.adminLogin)(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(error_utils_1.CustomError));
        const err = next.mock.calls[0][0];
        (0, vitest_1.expect)(err.message).toBe('Invalid credentials');
        (0, vitest_1.expect)(err.statusCode).toBe(401);
    });
    (0, vitest_1.it)('returns 200 with token and user on valid credentials', async () => {
        const mockUser = {
            _id: { toString: () => 'user1' },
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed',
            role: 'role1',
            status: 'active',
            lastLogin: null,
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        const mockRole = {
            _id: { toString: () => 'role1' },
            name: 'client-admin',
            isSuperAdmin: false,
        };
        mockReq.body = { email: 'test@example.com', password: 'correctpass' };
        user_model_1.User.findOne.mockReturnValue(createUserQuery(mockUser));
        role_model_1.Role.findById.mockResolvedValue(mockRole);
        bcryptjs_1.default.compare.mockResolvedValue(true);
        await (0, auth_controller_1.adminLogin)(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
        (0, vitest_1.expect)(statusMock).toHaveBeenCalledWith(200);
        (0, vitest_1.expect)(jsonMock).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            accessToken: 'mock-jwt-token',
            user: vitest_1.expect.objectContaining({
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                roleName: 'client-admin',
            }),
        }));
        (0, vitest_1.expect)(jsonwebtoken_1.default.sign).toHaveBeenCalled();
    });
});
