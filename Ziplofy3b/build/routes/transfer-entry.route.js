"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferEntryRouter = void 0;
const express_1 = require("express");
const transfer_entry_controller_1 = require("../controllers/transfer-entry.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.transferEntryRouter = (0, express_1.Router)();
// Protect the route
exports.transferEntryRouter.use(auth_middleware_1.protect);
// Get entries for a transfer
exports.transferEntryRouter.get("/transfer/:id", transfer_entry_controller_1.getTransferEntriesByTransferId);
