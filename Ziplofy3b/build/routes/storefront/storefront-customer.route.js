"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontCustomerRouter = void 0;
const express_1 = require("express");
const storefront_customer_controller_1 = require("../../controllers/storefront/storefront-customer.controller");
const storefront_auth_middleware_1 = require("../../middlewares/storefront-auth.middleware");
exports.storefrontCustomerRouter = (0, express_1.Router)();
exports.storefrontCustomerRouter.use(storefront_auth_middleware_1.storefrontProtect);
// Update customer profile (storefront)
exports.storefrontCustomerRouter.patch('/:customerId', storefront_customer_controller_1.updateCustomer);
