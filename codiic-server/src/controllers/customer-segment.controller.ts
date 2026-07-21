import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CustomerSegment } from '../models';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

export const createCustomerSegment = async (req: Request, res: Response) => {
  try {
    const { storeId, name } = req.body as { storeId?: string; name?: string };
    if (!storeId) return res.status(400).json({ success: false, message: 'storeId is required' });
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'name is required' });

    const doc = await CustomerSegment.create({ storeId: new mongoose.Types.ObjectId(storeId), name: name.trim() });
    return res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'A segment with this name already exists for this store' });
    }
    return res.status(500).json({ success: false, message: err?.message || 'Failed to create customer segment' });
  }
};

export const getCustomerSegmentsByStore = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params as { storeId?: string };
    if (!storeId) return res.status(400).json({ success: false, message: 'storeId is required' });

    const list = await CustomerSegment.find({ storeId: new mongoose.Types.ObjectId(storeId) }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customer segments' });
  }
};

export const updateCustomerSegmentName = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    const { name } = req.body as { name?: string };
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'name is required' });

    const updated = await CustomerSegment.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: { name: name.trim() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Customer segment not found' });
    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'A segment with this name already exists for this store' });
    }
    return res.status(500).json({ success: false, message: err?.message || 'Failed to update customer segment' });
  }
};

// Search customer segments with fuzzy search
export const searchCustomerSegments = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!storeId) throw new CustomError("storeId is required", 400);
  if (!q || typeof q !== 'string') throw new CustomError("Search query 'q' is required", 400);

  const skip = (Number(page) - 1) * Number(limit);

  // Simple fuzzy search on customer segment names
  const searchCriteria = {
    storeId: new mongoose.Types.ObjectId(storeId),
    name: { $regex: q, $options: 'i' }
  };

  // Get customer segments with pagination
  const customerSegments = await CustomerSegment.find(searchCriteria)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Get total count for pagination
  const totalSegments = await CustomerSegment.countDocuments(searchCriteria);

  res.status(200).json({
    success: true,
    data: customerSegments,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalSegments / Number(limit)),
      totalItems: totalSegments,
      itemsPerPage: Number(limit)
    }
  });
});


