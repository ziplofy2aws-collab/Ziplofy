"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerTagsRouter = void 0;
const express_1 = require("express");
const customer_tags_controller_1 = require("../controllers/customer-tags.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.customerTagsRouter = (0, express_1.Router)();
// Apply authentication middleware to all routes
exports.customerTagsRouter.use(auth_middleware_1.protect);
// GET /api/customer-tags/store/:storeId - Get customer tags by store ID
exports.customerTagsRouter.get("/store/:storeId", customer_tags_controller_1.getCustomerTagsByStoreId);
// POST /api/customer-tags - Create a new customer tag
exports.customerTagsRouter.post("/", customer_tags_controller_1.createCustomerTag);
// DELETE /api/customer-tags/:id - Delete a customer tag by ID
exports.customerTagsRouter.delete("/:id", customer_tags_controller_1.deleteCustomerTag);
