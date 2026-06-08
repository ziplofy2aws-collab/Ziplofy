"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productVariantRouter = void 0;
const express_1 = require("express");
const product_variant_controller_1 = require("../controllers/product-variant.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.productVariantRouter = (0, express_1.Router)();
// Public route for getting variants by product id
exports.productVariantRouter.get("/public/product/:productId", product_variant_controller_1.getVariantsByProductIdPublic);
// Protect all variant routes
exports.productVariantRouter.use(auth_middleware_1.protect);
// GET variants by product id
exports.productVariantRouter.get("/product/:productId", product_variant_controller_1.getVariantsByProductId);
// GET single variant by id
exports.productVariantRouter.get("/:id", product_variant_controller_1.getVariantById);
// PATCH update variant by id
exports.productVariantRouter.patch("/:id", product_variant_controller_1.updateVariantById);
