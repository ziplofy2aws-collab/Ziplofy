import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CollectionEntry } from '../models/collection-entry/collection-entry.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

export const createCollectionEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { collectionId, productId, position } = req.body as {
    collectionId?: string;
    productId?: string;
    position?: number;
  };

  if (!collectionId || !productId) {
    throw new CustomError('collectionId and productId are required', 400);
  }
  if (!mongoose.isValidObjectId(collectionId) || !mongoose.isValidObjectId(productId)) {
    throw new CustomError('Invalid collectionId or productId', 400);
  }

  let resolvedPosition = typeof position === 'number' && Number.isFinite(position) && position >= 0
    ? Math.floor(position)
    : null;

  if (resolvedPosition === null) {
    const last = await CollectionEntry.findOne({ collectionId }).sort({ position: -1 }).select({ position: 1 }).lean();
    resolvedPosition = (last?.position || 0) + 1;
  }

  const entry = await CollectionEntry.create({ collectionId, productId, position: resolvedPosition });
  
  // Populate the product data to match product controller response format
  const populatedEntry = await CollectionEntry.findById(entry._id)
    .populate({ 
      path: 'productId',
      populate: [
        { path: 'category' },
        { path: 'package', model: 'Packaging' },
        { path: 'tagIds', model: 'ProductTags' },
        { path: 'vendor', model: 'Vendor' }
      ]
    });

  res.status(201).json({ 
    success: true, 
    data: populatedEntry, 
    message: 'Collection entry created successfully' 
  });
});

export const deleteCollectionEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid id is required', 400);
  }

  const deleted = await CollectionEntry.findByIdAndDelete(id);
  if (!deleted) {
    throw new CustomError('Collection entry not found', 404);
  }
  res.status(200).json({ success: true, data: { deletedId: id }, message: 'Collection entry deleted successfully' });
});

export const getCollectionEntriesByCollectionId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid collection id is required', 400);
  }

  const entries = await CollectionEntry.find({ collectionId: id })
    .populate({ 
      path: 'productId',
      populate: [
        { path: 'category' },
        { path: 'package', model: 'Packaging' },
        { path: 'tagIds', model: 'ProductTags' },
        { path: 'vendor', model: 'Vendor' }
      ]
    })
    .sort({ position: 1, createdAt: 1 });

  res.status(200).json({ 
    success: true, 
    data: entries, 
    count: entries.length,
    message: 'Collection entries fetched successfully' 
  });
});


