"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransferTag = exports.getTransferTagsByStore = exports.createTransferTag = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tranfer_tags_model_1 = require("../models/transfer-tags/tranfer-tags.model");
const error_utils_1 = require("../utils/error.utils");
exports.createTransferTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        return res.status(400).json({ success: false, message: "Valid storeId is required" });
    }
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Tag name is required" });
    }
    const tag = await tranfer_tags_model_1.TransferTagModel.create({ storeId, name: name.trim() });
    return res.status(201).json({ success: true, data: tag });
});
exports.getTransferTagsByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        return res.status(400).json({ success: false, message: "Valid storeId is required" });
    }
    const tags = await tranfer_tags_model_1.TransferTagModel.find({ storeId }).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: tags, count: tags.length });
});
exports.deleteTransferTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Valid tag id is required" });
    }
    const deleted = await tranfer_tags_model_1.TransferTagModel.findByIdAndDelete(id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Tag not found" });
    }
    return res.status(200).json({ success: true, message: "Tag deleted", data: { deletedTag: deleted } });
});
