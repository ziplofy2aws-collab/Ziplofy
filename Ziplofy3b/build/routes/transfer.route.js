"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferRouter = void 0;
const express_1 = require("express");
const transfer_controller_1 = require("../controllers/transfer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.transferRouter = (0, express_1.Router)();
exports.transferRouter.use(auth_middleware_1.protect);
// Create a transfer
exports.transferRouter.post("/", transfer_controller_1.createTransfer);
// Get transfers by store id
exports.transferRouter.get("/store/:storeId", transfer_controller_1.getTransfersByStoreId);
// Update a transfer
exports.transferRouter.put("/:id", transfer_controller_1.updateTransfer);
// Delete a transfer
exports.transferRouter.delete("/:id", transfer_controller_1.deleteTransfer);
// Mark transfer as ready to ship
exports.transferRouter.post("/:id/ready-to-ship", transfer_controller_1.markTransferReadyToShip);
