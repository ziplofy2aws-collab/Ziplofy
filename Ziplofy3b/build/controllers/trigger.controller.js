"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTriggers = void 0;
const trigger_model_1 = require("../models/trigger/trigger.model");
const error_utils_1 = require("../utils/error.utils");
exports.getAllTriggers = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const triggers = await trigger_model_1.Trigger.find({}).lean();
    return res.status(200).json({
        success: true,
        data: triggers,
        message: 'Triggers fetched successfully',
    });
});
