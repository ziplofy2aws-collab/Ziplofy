import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TransferTimelineModel } from '../models/transfer-timeline/transfer-timeline.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /transfer-timelines
export const createTransferTimeline = asyncErrorHandler(async (req: Request, res: Response) => {
  const { transferId,comment } = req.body as { transferId?: string; comment?: string };
  if (!transferId || !mongoose.isValidObjectId(transferId)) {
    throw new CustomError('Valid transferId is required', 400);
  }
  if (!comment || typeof comment !== 'string') {
    throw new CustomError('comment is required', 400);
  }

  const doc = await TransferTimelineModel.create({ transferId: new mongoose.Types.ObjectId(transferId), type:"comment", comment });
  return res.status(201).json({ success: true, data: doc, message: 'Transfer timeline entry created' });
});

// GET /transfer-timelines/transfer/:transferId
export const getTransferTimelineByTransferId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { transferId } = req.params as { transferId: string };
  if (!transferId || !mongoose.isValidObjectId(transferId)) {
    throw new CustomError('Valid transferId is required', 400);
  }
  const list = await TransferTimelineModel.find({ transferId: new mongoose.Types.ObjectId(transferId) }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: list });
});

// PUT /transfer-timelines/:id
export const updateTransferTimeline = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid id is required', 400);
  }
  const { comment } = req.body as { comment: string };
  const update: any = {};
  if (comment !== undefined) update.comment = comment;

  const updated = await TransferTimelineModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!updated) throw new CustomError('Transfer timeline entry not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Transfer timeline entry updated' });
});

// DELETE /transfer-timelines/:id
export const deleteTransferTimeline = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid id is required', 400);
  }
  const deleted = await TransferTimelineModel.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Transfer timeline entry not found', 404);
  return res.status(200).json({ success: true, message: 'Transfer timeline entry deleted' });
});


