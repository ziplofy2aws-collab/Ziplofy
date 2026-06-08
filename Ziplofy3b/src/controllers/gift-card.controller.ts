import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GiftCard } from '../models/gift-cards/gift-card.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Create gift card
export const createGiftCard = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, code, initialValue, expirationDate, notes, isActive } = req.body;

  if (!storeId || !code || initialValue === undefined) {
    throw new CustomError('storeId, code and initialValue are required', 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  if (initialValue < 0) {
    throw new CustomError('initialValue cannot be negative', 400);
  }

  // Check if expiration date is in the future
  if (expirationDate && new Date(expirationDate) <= new Date()) {
    throw new CustomError('expirationDate must be in the future', 400);
  }

  const giftCard = await GiftCard.create({
    storeId,
    code,
    initialValue,
    expirationDate: expirationDate ? new Date(expirationDate) : undefined,
    notes,
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json({
    success: true,
    data: giftCard,
    message: 'Gift card created successfully'
  });
});

// Get gift cards by store id
export const getGiftCardsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  
  if (!storeId) {
    throw new CustomError('storeId is required', 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const giftCards = await GiftCard.find({storeId})
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: giftCards,
    count: giftCards.length
  });
});

// Update gift card
export const updateGiftCard = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, initialValue, expirationDate, notes, isActive } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid gift card id', 400);
  }

  // First, check if the gift card exists and is active
  const existingGiftCard = await GiftCard.findById(id);
  if (!existingGiftCard) {
    throw new CustomError('Gift card not found', 404);
  }

  // Check if gift card is deactivated
  if (!existingGiftCard.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Gift card deactivated, no actions can be done now'
    });
  }

  if (initialValue !== undefined && initialValue < 0) {
    throw new CustomError('initialValue cannot be negative', 400);
  }

  // Check if expiration date is in the future
  if (expirationDate && new Date(expirationDate) <= new Date()) {
    throw new CustomError('expirationDate must be in the future', 400);
  }

  const updateData: any = {};
  if (code !== undefined) updateData.code = code;
  if (initialValue !== undefined) updateData.initialValue = initialValue;
  if (expirationDate !== undefined) {
    updateData.expirationDate = expirationDate ? new Date(expirationDate) : null;
  }
  if (notes !== undefined) updateData.notes = notes;
  if (isActive !== undefined) updateData.isActive = isActive;

  const giftCard = await GiftCard.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!giftCard) {
    throw new CustomError('Gift card not found', 404);
  }

  res.status(200).json({
    success: true,
    data: giftCard,
    message: 'Gift card updated successfully'
  });
});

// Soft delete gift card (set isActive to false)
export const deleteGiftCard = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid gift card id', 400);
  }

  // First, check if the gift card exists
  const existingGiftCard = await GiftCard.findById(id);
  if (!existingGiftCard) {
    throw new CustomError('Gift card not found', 404);
  }

  // Check if gift card is already deactivated
  if (!existingGiftCard.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Gift card already deactivated, no actions can be done now'
    });
  }

  const giftCard = await GiftCard.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true }
  );
  if (!giftCard) {
    throw new CustomError('Gift card not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      deletedGiftCard: {
        id: giftCard._id,
        code: giftCard.code,
        initialValue: giftCard.initialValue,
        isActive: giftCard.isActive
      }
    },
    message: 'Gift card deactivated successfully'
  });
});
