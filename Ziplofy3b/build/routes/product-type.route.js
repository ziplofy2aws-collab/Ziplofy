"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTypeRouter = void 0;
const express_1 = require("express");
const product_type_controller_1 = require("../controllers/product-type.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.productTypeRouter = (0, express_1.Router)();
// Apply authentication middleware to all routes
exports.productTypeRouter.use(auth_middleware_1.protect);
// Product type routes
exports.productTypeRouter.post('/', product_type_controller_1.createProductType);
exports.productTypeRouter.get('/store/:storeId', product_type_controller_1.getProductTypesByStoreId);
exports.productTypeRouter.delete('/:id', product_type_controller_1.deleteProductType);
