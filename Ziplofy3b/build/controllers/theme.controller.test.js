"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const theme_controller_1 = require("./theme.controller");
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
(0, vitest_1.describe)('theme.controller - getThemes', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockReq = { query: {} };
        mockRes = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
        mockNext = vitest_1.vi.fn();
    });
    (0, vitest_1.it)('builds filter from query and returns paginated result', async () => {
        const mockThemes = [{ _id: 't1', name: 'Theme 1' }];
        mockThemeFindChain(mockThemes);
        theme_model_1.Theme.countDocuments.mockResolvedValue(1);
        mockReq.query = { page: '1', limit: '10', search: 'foo', category: 'ecommerce' };
        await (0, theme_controller_1.getThemes)(mockReq, mockRes, mockNext);
        (0, vitest_1.expect)(theme_model_1.Theme.find).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            isActive: true,
            $text: { $search: 'foo' },
            category: 'ecommerce',
        }));
        (0, vitest_1.expect)(mockRes.status).toHaveBeenCalledWith(200);
        (0, vitest_1.expect)(mockRes.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            success: true,
            data: vitest_1.expect.arrayContaining([vitest_1.expect.objectContaining({ _id: 't1', name: 'Theme 1' })]),
            totalPages: 1,
            currentPage: 1,
            total: 1,
        }));
    });
    (0, vitest_1.it)('uses default pagination when query is empty', async () => {
        mockThemeFindChain([]);
        theme_model_1.Theme.countDocuments.mockResolvedValue(0);
        await (0, theme_controller_1.getThemes)(mockReq, mockRes, mockNext);
        (0, vitest_1.expect)(theme_model_1.Theme.find).toHaveBeenCalledWith({ isActive: true });
        (0, vitest_1.expect)(mockRes.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            success: true,
            data: [],
            total: 0,
        }));
    });
});
