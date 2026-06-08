"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAutomationFlow = exports.createAutomationFlow = exports.getAutomationFlowsByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const automation_flow_model_1 = require("../models/automation/automation-flow.model");
const error_utils_1 = require("../utils/error.utils");
exports.getAutomationFlowsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || typeof storeId !== 'string') {
        return res.status(400).json({ success: false, data: null, message: 'storeId is required' });
    }
    const flows = await automation_flow_model_1.AutomationFlow.find({ storeId }).lean();
    return res.status(200).json({ success: true, data: flows, message: 'Automation flows fetched successfully' });
});
exports.createAutomationFlow = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name, description, triggerId, triggerKey, isActive, flowData } = req.body || {};
    if (!storeId || !name || !triggerId || !triggerKey || !flowData) {
        return res.status(400).json({ success: false, data: null, message: 'storeId, name, triggerId, triggerKey and flowData are required' });
    }
    if (!mongoose_1.default.isValidObjectId(triggerId)) {
        return res.status(400).json({ success: false, data: null, message: 'Invalid triggerId' });
    }
    if (!Object.values(automation_flow_model_1.TriggerKey).includes(triggerKey)) {
        return res.status(400).json({ success: false, data: null, message: 'Invalid triggerKey' });
    }
    const created = await automation_flow_model_1.AutomationFlow.create({
        storeId,
        name,
        description: description || '',
        triggerId,
        triggerKey,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        flowData,
    });
    return res.status(201).json({ success: true, data: created, message: 'Automation flow created successfully' });
});
exports.updateAutomationFlow = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { automationFlowId } = req.params;
    if (!mongoose_1.default.isValidObjectId(automationFlowId)) {
        return res.status(400).json({ success: false, data: null, message: 'Invalid automationFlowId' });
    }
    const { name, description, isActive, flowData, triggerId, triggerKey } = req.body || {};
    const update = {};
    if (typeof name === 'string')
        update.name = name;
    if (typeof description === 'string')
        update.description = description;
    if (typeof isActive === 'boolean')
        update.isActive = isActive;
    if (flowData !== undefined)
        update.flowData = flowData;
    if (triggerId) {
        if (!mongoose_1.default.isValidObjectId(triggerId)) {
            return res.status(400).json({ success: false, data: null, message: 'Invalid triggerId' });
        }
        update.triggerId = triggerId;
    }
    if (triggerKey) {
        if (!Object.values(automation_flow_model_1.TriggerKey).includes(triggerKey)) {
            return res.status(400).json({ success: false, data: null, message: 'Invalid triggerKey' });
        }
        update.triggerKey = triggerKey;
    }
    const updated = await automation_flow_model_1.AutomationFlow.findByIdAndUpdate(automationFlowId, { $set: update }, { new: true }).lean();
    if (!updated) {
        return res.status(404).json({ success: false, data: null, message: 'Automation flow not found' });
    }
    return res.status(200).json({ success: true, data: updated, message: 'Automation flow updated successfully' });
});
