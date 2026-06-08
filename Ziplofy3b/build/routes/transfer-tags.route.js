"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferTagsRouter = void 0;
const express_1 = require("express");
const transfer_tags_controller_1 = require("../controllers/transfer-tags.controller");
exports.transferTagsRouter = (0, express_1.Router)();
// Create a transfer tag
exports.transferTagsRouter.post("/", transfer_tags_controller_1.createTransferTag);
// Get transfer tags by store id
exports.transferTagsRouter.get("/store/:storeId", transfer_tags_controller_1.getTransferTagsByStore);
// Delete a transfer tag by id
exports.transferTagsRouter.delete("/:id", transfer_tags_controller_1.deleteTransferTag);
