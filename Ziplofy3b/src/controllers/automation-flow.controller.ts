import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AutomationFlow, TriggerKey } from '../models/automation/automation-flow.model';
import { asyncErrorHandler } from '../utils/error.utils';

export const getAutomationFlowsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId || typeof storeId !== 'string') {
    return res.status(400).json({ success: false, data: null, message: 'storeId is required' });
  }

  const flows = await AutomationFlow.find({ storeId }).lean();

  return res.status(200).json({ success: true, data: flows, message: 'Automation flows fetched successfully' });
});

export const createAutomationFlow = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name, description, triggerId, triggerKey, isActive, flowData } = req.body || {};

  if (!storeId || !name || !triggerId || !triggerKey || !flowData) {
    return res.status(400).json({ success: false, data: null, message: 'storeId, name, triggerId, triggerKey and flowData are required' });
  }

  if (!mongoose.isValidObjectId(triggerId)) {
    return res.status(400).json({ success: false, data: null, message: 'Invalid triggerId' });
  }

  if (!Object.values(TriggerKey).includes(triggerKey)) {
    return res.status(400).json({ success: false, data: null, message: 'Invalid triggerKey' });
  }

  const created = await AutomationFlow.create({
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

export const updateAutomationFlow = asyncErrorHandler(async (req: Request, res: Response) => {
  const { automationFlowId } = req.params as { automationFlowId: string };
  if (!mongoose.isValidObjectId(automationFlowId)) {
    return res.status(400).json({ success: false, data: null, message: 'Invalid automationFlowId' });
  }

  const { name, description, isActive, flowData, triggerId, triggerKey } = req.body || {};

  const update: any = {};
  if (typeof name === 'string') update.name = name;
  if (typeof description === 'string') update.description = description;
  if (typeof isActive === 'boolean') update.isActive = isActive;
  if (flowData !== undefined) update.flowData = flowData;
  if (triggerId) {
    if (!mongoose.isValidObjectId(triggerId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid triggerId' });
    }
    update.triggerId = triggerId;
  }
  if (triggerKey) {
    if (!Object.values(TriggerKey).includes(triggerKey)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid triggerKey' });
    }
    update.triggerKey = triggerKey;
  }

  const updated = await AutomationFlow.findByIdAndUpdate(automationFlowId, { $set: update }, { new: true }).lean();
  if (!updated) {
    return res.status(404).json({ success: false, data: null, message: 'Automation flow not found' });
  }

  return res.status(200).json({ success: true, data: updated, message: 'Automation flow updated successfully' });
});


