import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ReturnRules } from '../models/return-rules/return-rules.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Create return rules
export const createReturnRules = asyncErrorHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  const required = ['storeId', 'returnWindow', 'returnShippingCost'];
  for (const f of required) if (!body[f]) throw new CustomError(`Missing required field: ${f}`, 400);
  if (!mongoose.isValidObjectId(body.storeId)) throw new CustomError('Invalid storeId', 400);

  const created = await ReturnRules.create({
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
export const updateReturnRules = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const body = req.body as any;
  const update: any = {};
  if (body.enabled !== undefined) update.enabled = !!body.enabled;
  if (body.returnWindow !== undefined) update.returnWindow = String(body.returnWindow);
  if (body.returnShippingCost !== undefined) update.returnShippingCost = body.returnShippingCost;
  if (body.flatRate !== undefined) update.flatRate = body.flatRate;
  if (body.chargeRestockingFree !== undefined) update.chargeRestockingFree = !!body.chargeRestockingFree;
  if (body.restockingFee !== undefined) update.restockingFee = body.restockingFee;
  if (body.finalSaleSelection !== undefined) {
    if (['collections', 'products'].includes(body.finalSaleSelection)) {
      update.finalSaleSelection = body.finalSaleSelection;
    } else if (body.finalSaleSelection === '' || body.finalSaleSelection === null) {
      update.finalSaleSelection = 'collections';
    } else {
      throw new CustomError('finalSaleSelection must be either "collections" or "products"', 400);
    }
  }

  const updated = await ReturnRules.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Return rules not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Return rules updated' });
});

// Get return rules by store id (latest)
export const getReturnRulesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const rule = await ReturnRules.findOne({ storeId }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: rule, message: rule ? 'Return rules fetched' : 'No return rules found' });
});


