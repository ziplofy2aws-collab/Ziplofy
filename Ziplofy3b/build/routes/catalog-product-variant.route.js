"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalog_product_variant_controller_1 = require("../controllers/catalog-product-variant.controller");
const catalogProductVariantRouter = (0, express_1.Router)();
catalogProductVariantRouter.put('/:id', catalog_product_variant_controller_1.updateCatalogProductVariant);
exports.default = catalogProductVariantRouter;
