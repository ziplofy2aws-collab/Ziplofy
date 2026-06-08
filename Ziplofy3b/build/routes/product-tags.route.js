"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTagsRouter = void 0;
const express_1 = require("express");
const product_tags_controller_1 = require("../controllers/product-tags.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.productTagsRouter = (0, express_1.Router)();
// Apply authentication middleware to all routes
exports.productTagsRouter.use(auth_middleware_1.protect);
// GET /api/product-tags/store/:storeId - Get product tags by store ID
exports.productTagsRouter.get("/store/:storeId", product_tags_controller_1.getProductTagsByStoreId);
// POST /api/product-tags - Create a new product tag
exports.productTagsRouter.post("/", product_tags_controller_1.createProductTag);
// DELETE /api/product-tags/:id - Delete a product tag by ID
exports.productTagsRouter.delete("/:id", product_tags_controller_1.deleteProductTag);
