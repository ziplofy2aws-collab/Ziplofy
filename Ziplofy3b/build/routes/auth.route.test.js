"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const auth_route_1 = require("./auth.route");
const error_middleware_1 = require("../middlewares/error.middleware");
function createUserQuery(mockResult) {
    return {
        select: vitest_1.vi.fn().mockResolvedValue(mockResult),
    };
}
vitest_1.vi.mock('../models/user.model', () => ({
    User: {
        findOne: vitest_1.vi.fn(),
        findById: vitest_1.vi.fn(),
        findByIdAndUpdate: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('../models/role.model', () => ({
    Role: {
        findById: vitest_1.vi.fn(),
        findOne: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('bcryptjs', () => ({
    default: {
        compare: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vitest_1.vi.fn(() => 'mock-jwt-token'),
        verify: vitest_1.vi.fn(),
    },
}));
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/auth', auth_route_1.authRouter);
    app.use(error_middleware_1.errorMiddleware);
    return app;
}
(0, vitest_1.describe)('auth routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'test-secret';
    });
    (0, vitest_1.describe)('POST /api/auth/admin/login', () => {
        (0, vitest_1.it)('returns 400 when email and password are missing', async () => {
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app).post('/api/auth/admin/login').send({});
            (0, vitest_1.expect)(res.status).toBe(400);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error).toContain('Please provide email and password');
        });
        (0, vitest_1.it)('returns 401 when user not found', async () => {
            user_model_1.User.findOne.mockReturnValue(createUserQuery(null));
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app)
                .post('/api/auth/admin/login')
                .send({ email: 'unknown@example.com', password: 'pass123' });
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
        });
        (0, vitest_1.it)('returns 200 with token on valid credentials', async () => {
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
            user_model_1.User.findOne.mockReturnValue(createUserQuery(mockUser));
            role_model_1.Role.findById.mockResolvedValue(mockRole);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app)
                .post('/api/auth/admin/login')
                .send({ email: 'test@example.com', password: 'correctpass' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.accessToken).toBe('mock-jwt-token');
            (0, vitest_1.expect)(res.body.user.email).toBe('test@example.com');
        });
    });
});
