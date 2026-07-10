"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const custom_theme_route_1 = require("./custom-theme.route");
const error_middleware_1 = require("../middlewares/error.middleware");
const constants_1 = require("../constants");
vitest_1.vi.mock('../models/custom-theme.model', () => ({
    CustomTheme: {
        find: vitest_1.vi.fn(),
        findOne: vitest_1.vi.fn(),
        findById: vitest_1.vi.fn(),
    },
}));
const custom_theme_model_1 = require("../models/custom-theme.model");
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/custom-themes', custom_theme_route_1.customThemeRouter);
    app.use(error_middleware_1.errorMiddleware);
    return app;
}
(0, vitest_1.describe)('custom-theme routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'test-secret';
    });
    (0, vitest_1.describe)('GET /api/custom-themes', () => {
        (0, vitest_1.it)('returns 401 without auth token', async () => {
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app).get('/api/custom-themes');
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
        });
        (0, vitest_1.it)('returns 200 with themes when valid token provided', async () => {
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
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app)
                .get('/api/custom-themes')
                .set('Authorization', `Bearer ${constants_1.SUPER_ADMIN_TOKEN}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
