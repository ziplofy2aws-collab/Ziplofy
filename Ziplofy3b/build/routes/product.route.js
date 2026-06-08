"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.productRouter = (0, express_1.Router)();
// Public route for getting products by store ID with pagination
exports.productRouter.get("/public/store/:storeId", product_controller_1.getProductsByStoreIdPublic);
// Public route for getting product details by product ID
exports.productRouter.get("/public/:productId", product_controller_1.getProductByIdPublic);
// Protect all product routes (adjust if public create not desired)
exports.productRouter.use(auth_middleware_1.protect);
// Create product
exports.productRouter.post("/", product_controller_1.createProduct);
// Partial update product
exports.productRouter.patch("/:id", product_controller_1.updateProductById);
// Soft delete product
exports.productRouter.delete("/:id", product_controller_1.softDeleteProductById);
// Get products by store id
exports.productRouter.get("/store/:storeId", product_controller_1.getProductsByStoreId);
// add variants to product
exports.productRouter.post("/:id/variants", product_controller_1.addVariantsToProduct);
// delete variants from product
exports.productRouter.delete("/:id/variants", product_controller_1.deleteVariantsFromProduct);
// add option to existing variant dimension
exports.productRouter.post("/:id/variants/:dimensionName/options", product_controller_1.addOptionToProduct);
// delete option from existing variant dimension
// productRouter.delete("/:id/variants/:dimensionName/options", deleteOptionFromVariantDimension);
// search products with availability
exports.productRouter.get("/search", product_controller_1.searchProductsWithAvailability);
// search products basic (title + first image + id)
exports.productRouter.get("/search-basic", product_controller_1.searchProductsBasic);
// search products with variants (no availability)
exports.productRouter.get("/search-with-variants", product_controller_1.searchProductsWithVariants);
// search products with variant and destination availability
exports.productRouter.get("/search-product-with-variant-and-destination", product_controller_1.searchProductsWithVariantAndDestination);
// Get single product by id (keep after specific GET routes)
exports.productRouter.get("/:id", product_controller_1.getProductById);
