"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnRulesByStoreId = exports.updateReturnRules = exports.createReturnRules = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const return_rules_model_1 = require("../models/return-rules/return-rules.model");
const error_utils_1 = require("../utils/error.utils");
// Create return rules
exports.createReturnRules = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const body = req.body;
    const required = ['storeId', 'returnWindow', 'returnShippingCost'];
    for (const f of required)
        if (!body[f])
            throw new error_utils_1.CustomError(`Missing required field: ${f}`, 400);
    if (!mongoose_1.default.isValidObjectId(body.storeId))
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    const created = await return_rules_model_1.ReturnRules.create({
        storeId: body.storeId,
        enabled: !!body.enabled,
        returnWindow: String(body.returnWindow),
        returnShippingCost: body.returnShippingCost,
        flatRate: body.flatRate,
        chargeRestockingFree: !!body.chargeRestockingFree,
        restockingFee: body.restockingFee,
        finalSaleSelection: body.finalSaleSelection && ['collections', 'products'].includes(body.finalSaleSelection)
            ? body.finalSaleSelection
            : 'collections',
    });
    return res.status(201).json({ success: true, data: created, message: 'Return rules created' });
});
// Update return rules by id
exports.updateReturnRules = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const body = req.body;
    const update = {};
    if (body.enabled !== undefined)
        update.enabled = !!body.enabled;
    if (body.returnWindow !== undefined)
        update.returnWindow = String(body.returnWindow);
    if (body.returnShippingCost !== undefined)
        update.returnShippingCost = body.returnShippingCost;
    if (body.flatRate !== undefined)
        update.flatRate = body.flatRate;
    if (body.chargeRestockingFree !== undefined)
        update.chargeRestockingFree = !!body.chargeRestockingFree;
    if (body.restockingFee !== undefined)
        update.restockingFee = body.restockingFee;
    if (body.finalSaleSelection !== undefined) {
        if (['collections', 'products'].includes(body.finalSaleSelection)) {
            update.finalSaleSelection = body.finalSaleSelection;
        }
        else if (body.finalSaleSelection === '' || body.finalSaleSelection === null) {
            update.finalSaleSelection = 'collections';
        }
        else {
            throw new error_utils_1.CustomError('finalSaleSelection must be either "collections" or "products"', 400);
        }
    }
    const updated = await return_rules_model_1.ReturnRules.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Return rules not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Return rules updated' });
});
// Get return rules by store id (latest)
exports.getReturnRulesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const rule = await return_rules_model_1.ReturnRules.findOne({ storeId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: rule, message: rule ? 'Return rules fetched' : 'No return rules found' });
});
