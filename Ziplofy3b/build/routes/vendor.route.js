"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRouter = void 0;
const express_1 = require("express");
const vendor_controller_1 = require("../controllers/vendor.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.vendorRouter = (0, express_1.Router)();
exports.vendorRouter.use(auth_middleware_1.protect);
// POST /api/vendors - Add a new vendor
exports.vendorRouter.post("/", vendor_controller_1.addVendor);
// DELETE /api/vendors/:id - Delete a vendor by ID
exports.vendorRouter.delete("/:id", vendor_controller_1.deleteVendor);
// GET /api/vendors/store/:storeId - Get vendors by store
exports.vendorRouter.get("/store/:storeId", vendor_controller_1.getVendorsByStoreId);
