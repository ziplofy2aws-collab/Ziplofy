"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_middleware_1 = require("./auth.middleware");
const constants_1 = require("../constants");
function createUserFindByIdChain(mockResult) {
    return {
        select: vitest_1.vi.fn().mockReturnValue({
            populate: vitest_1.vi.fn().mockResolvedValue(mockResult),
        }),
    };
}
vitest_1.vi.mock('../models/user.model', () => ({
    User: {
        findById: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vitest_1.vi.fn(),
    },
}));
const user_model_1 = require("../models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, vitest_1.describe)('protect', () => {
    let mockReq;
    let mockRes;
    let next;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockReq = { headers: {} };
        mockRes = {};
        next = vitest_1.vi.fn();
        process.env.ACCESS_TOKEN_SECRET = 'test-secret';
    });
    (0, vitest_1.it)('returns 401 when no token provided', async () => {
        mockReq.headers = {};
        await auth_middleware_1.protect(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 }));
    });
    (0, vitest_1.it)('returns 401 when Authorization header has no Bearer prefix', async () => {
        mockReq.headers = { authorization: 'Basic xxx' };
        await auth_middleware_1.protect(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 }));
    });
    (0, vitest_1.it)('sets req.user when SUPER_ADMIN_TOKEN is provided', async () => {
        mockReq.headers = { authorization: `Bearer ${constants_1.SUPER_ADMIN_TOKEN}` };
        await auth_middleware_1.protect(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith();
        (0, vitest_1.expect)(mockReq.user).toBeDefined();
        (0, vitest_1.expect)(mockReq.user?.role).toBe('super-admin');
        (0, vitest_1.expect)(mockReq.user?.superAdmin).toBe(true);
    });
    (0, vitest_1.it)('sets req.user when valid JWT and user found in database', async () => {
        const decoded = { uid: 'user123', email: 'test@example.com', role: 'client-admin' };
        jsonwebtoken_1.default.verify.mockReturnValue(decoded);
        const mockUser = {
            _id: { toString: () => 'user123' },
            name: 'Test User',
            email: 'test@example.com',
            role: { name: 'client-admin', isSuperAdmin: false, _id: { toString: () => 'role1' } },
            assignedSupportDeveloperId: null,
        };
        user_model_1.User.findById.mockReturnValue(createUserFindByIdChain(mockUser));
        mockReq.headers = { authorization: 'Bearer valid-jwt-token' };
        await auth_middleware_1.protect(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith();
        (0, vitest_1.expect)(mockReq.user).toBeDefined();
        (0, vitest_1.expect)(mockReq.user?.id).toBe('user123');
        (0, vitest_1.expect)(mockReq.user?.email).toBe('test@example.com');
    });
    (0, vitest_1.it)('returns 401 when JWT verification fails', async () => {
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });
        mockReq.headers = { authorization: 'Bearer invalid-token' };
        await auth_middleware_1.protect(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 }));
    });
});
(0, vitest_1.describe)('authorize', () => {
    let mockReq;
    let mockRes;
    let next;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockReq = {};
        mockRes = {};
        next = vitest_1.vi.fn();
    });
    (0, vitest_1.it)('returns 401 when no user in request', () => {
        const middleware = (0, auth_middleware_1.authorize)('admin', 'super-admin');
        middleware(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ message: 'Not authorized to access this route', statusCode: 401 }));
    });
    (0, vitest_1.it)('allows super admin regardless of required roles', () => {
        mockReq.user = { role: 'super-admin', superAdmin: true };
        const middleware = (0, auth_middleware_1.authorize)('admin');
        middleware(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith();
    });
    (0, vitest_1.it)('returns 403 when user role is not in allowed roles', () => {
        mockReq.user = { role: 'client', superAdmin: false };
        const middleware = (0, auth_middleware_1.authorize)('super-admin', 'support-admin');
        middleware(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            message: 'Role client is not authorized to access this route',
            statusCode: 403,
        }));
    });
    (0, vitest_1.it)('allows when user role is in allowed roles', () => {
        mockReq.user = { role: 'support-admin', superAdmin: false };
        const middleware = (0, auth_middleware_1.authorize)('super-admin', 'support-admin');
        middleware(mockReq, mockRes, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledWith();
    });
});
