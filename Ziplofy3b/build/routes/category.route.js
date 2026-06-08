"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.categoryRouter = (0, express_1.Router)();
// Protected routes (authentication required) — adjust if public access is desired
exports.categoryRouter.use(auth_middleware_1.protect);
// Get base categories (parent === null)
exports.categoryRouter.get("/base", category_controller_1.getBaseCategories);
// Get categories by parent id
exports.categoryRouter.get("/parent/:parentId", category_controller_1.getCategoriesByParentId);
