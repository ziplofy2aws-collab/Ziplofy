"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.beforeAll)(() => {
    process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-secret-key-for-unit-tests';
    process.env.SUPER_ADMIN_TOKEN =
        process.env.SUPER_ADMIN_TOKEN ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzdhNjM4ZDMwNjk3ZDg0MTMxMWRiMiIsImlhdCI6MTc1NzkxNDc0OCwiZXhwIjoxNzYwNTA2NzQ4fQ.l_WEb7jfKaITY9XKJCjozKtLCZgD3yU_HaDEAMZJINM';
});
