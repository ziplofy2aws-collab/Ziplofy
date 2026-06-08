"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_billing_address_controller_1 = require("../controllers/store-billing-address.controller");
const router = (0, express_1.Router)();
// GET by storeId
router.get("/store/:storeId", store_billing_address_controller_1.getStoreBillingAddressesByStoreId);
// CREATE
router.post("/", store_billing_address_controller_1.createStoreBillingAddress);
// UPDATE by id
router.put("/:id", store_billing_address_controller_1.updateStoreBillingAddress);
// DELETE by id
router.delete("/:id", store_billing_address_controller_1.deleteStoreBillingAddress);
exports.default = router;
