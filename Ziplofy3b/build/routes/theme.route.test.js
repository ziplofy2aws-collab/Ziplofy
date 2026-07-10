"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const theme_route_1 = require("./theme.route");
const error_middleware_1 = require("../middlewares/error.middleware");
vitest_1.vi.mock('../models/theme.model', () => ({
    Theme: {
        find: vitest_1.vi.fn(),
        countDocuments: vitest_1.vi.fn(),
    },
}));
const theme_model_1 = require("../models/theme.model");
function mockThemeFindChain(result) {
    theme_model_1.Theme.find.mockReturnValue({
        populate: vitest_1.vi.fn().mockReturnValue({
            limit: vitest_1.vi.fn().mockReturnValue({
                skip: vitest_1.vi.fn().mockReturnValue({
                    sort: vitest_1.vi.fn().mockReturnValue({
                        lean: vitest_1.vi.fn().mockResolvedValue(result),
                    }),
                }),
            }),
        }),
    });
}
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/themes', theme_route_1.themeRouter);
    app.use(error_middleware_1.errorMiddleware);
    return app;
}
(0, vitest_1.describe)('theme routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('GET /api/themes', () => {
        (0, vitest_1.it)('returns 200 and applies filter from query (public route)', async () => {
            mockThemeFindChain([]);
            theme_model_1.Theme.countDocuments.mockResolvedValue(0);
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app)
                .get('/api/themes')
                .query({ search: 'foo', page: '1', limit: '10' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data).toBeDefined();
            (0, vitest_1.expect)(theme_model_1.Theme.find).toHaveBeenCalled();
        });
        (0, vitest_1.it)('returns paginated themes', async () => {
            const mockThemes = [{ _id: 't1', name: 'Theme 1' }];
            mockThemeFindChain(mockThemes);
            theme_model_1.Theme.countDocuments.mockResolvedValue(1);
            const app = createTestApp();
            const res = await (0, supertest_1.default)(app).get('/api/themes');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.data).toEqual(vitest_1.expect.arrayContaining([vitest_1.expect.objectContaining({ _id: 't1', name: 'Theme 1' })]));
            (0, vitest_1.expect)(res.body.total).toBe(1);
            (0, vitest_1.expect)(res.body.totalPages).toBe(1);
        });
    });
});
