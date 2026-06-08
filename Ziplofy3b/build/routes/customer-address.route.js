"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerAddressRouter = void 0;
const express_1 = require("express");
const customer_address_controller_1 = require("../controllers/customer-address.controller");
exports.customerAddressRouter = (0, express_1.Router)();
// customerAddressRouter.use(protect);
// GET /api/customer-address/customer/:customerId - Get addresses for a customer
exports.customerAddressRouter.get("/customer/:customerId", customer_address_controller_1.getCustomerAddressesByCustomerId);
// POST /api/customer-address - Create a new address
exports.customerAddressRouter.post("/", customer_address_controller_1.createCustomerAddress);
// put /api/customer-address/:id - Update an address
exports.customerAddressRouter.put("/:id", customer_address_controller_1.updateCustomerAddress);
// DELETE /api/customer-address/:id - Delete an address
exports.customerAddressRouter.delete("/:id", customer_address_controller_1.deleteCustomerAddress);
