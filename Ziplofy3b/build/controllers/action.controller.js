"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllActions = void 0;
const action_model_1 = require("../models/action/action.model");
const error_utils_1 = require("../utils/error.utils");
exports.getAllActions = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const actions = await action_model_1.Action.find({}).lean();
    return res.status(200).json({
        success: true,
        data: actions,
        message: 'Actions fetched successfully',
    });
});
