"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.customerRouter = (0, express_1.Router)();
exports.customerRouter.use(auth_middleware_1.protect);
// GET /api/customers/store/:storeId - Get customers by store ID
exports.customerRouter.get("/store/:storeId", customer_controller_1.getCustomersByStoreId);
// SEARCH /api/customers/search/:storeId - Search customers with fuzzy search
exports.customerRouter.get("/search/:storeId", customer_controller_1.searchCustomers);
// POST /api/customers - Add a new customer
exports.customerRouter.post("/", customer_controller_1.addCustomer);
// DELETE /api/customers/:id - Delete a customer by ID
exports.customerRouter.delete("/:id", customer_controller_1.deleteCustomer);
