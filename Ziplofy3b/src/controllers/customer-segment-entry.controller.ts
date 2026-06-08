import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CustomerSegmentEntry } from '../models';

export const createCustomerSegmentEntry = async (req: Request, res: Response) => {
  try {
    const { segmentId, customerId } = req.body as { segmentId?: string; customerId?: string };
    if (!segmentId) return res.status(400).json({ success: false, message: 'segmentId is required' });
    if (!customerId) return res.status(400).json({ success: false, message: 'customerId is required' });

    const created = await CustomerSegmentEntry.create({
      segmentId: new mongoose.Types.ObjectId(segmentId),
      customerId: new mongoose.Types.ObjectId(customerId),
    });
    // populate customer on response
    const populated = await created.populate('customerId');
    return res.status(201).json({ success: true, data: populated });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Customer already in this segment' });
    }
    return res.status(500).json({ success: false, message: err?.message || 'Failed to add customer to segment' });
  }
};

export const deleteCustomerSegmentEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    const deleted = await CustomerSegmentEntry.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    if (!deleted) return res.status(404).json({ success: false, message: 'Customer segment entry not found' });
    return res.status(200).json({ success: true, data: deleted });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to delete customer from segment' });
  }
};

export const getCustomerSegmentEntriesBySegment = async (req: Request, res: Response) => {
  try {
    const { segmentId } = req.params as { segmentId?: string };
    if (!segmentId) return res.status(400).json({ success: false, message: 'segmentId is required' });

    const entries = await CustomerSegmentEntry.find({ segmentId: new mongoose.Types.ObjectId(segmentId) })
      .populate('customerId')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: entries });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customer segment entries' });
  }
};


