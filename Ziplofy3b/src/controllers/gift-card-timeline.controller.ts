import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GiftCardTimelineModel } from '../models/gift-cards/gift-card-timeline.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Create timeline entry
export const createTimelineEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { giftCardId, comment } = req.body;

  if (!giftCardId || !comment) {
    throw new CustomError('giftCardId and comment are required', 400);
  }

  if (!mongoose.isValidObjectId(giftCardId)) {
    throw new CustomError('Invalid giftCardId', 400);
  }

  const timelineEntry = await GiftCardTimelineModel.create({
    giftCardId,
    type: "comment", // Default to comment for user-created entries
    comment
  });

  res.status(201).json({
    success: true,
    data: timelineEntry,
    message: 'Timeline entry created successfully'
  });
});

// Get timeline entries by gift card id
export const getTimelineByGiftCardId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { giftCardId } = req.params;

  if (!giftCardId) {
    throw new CustomError('giftCardId is required', 400);
  }

  if (!mongoose.isValidObjectId(giftCardId)) {
    throw new CustomError('Invalid giftCardId', 400);
  }

  const timelineEntries = await GiftCardTimelineModel.find({ giftCardId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: timelineEntries,
    count: timelineEntries.length
  });
});

// Update timeline entry
export const updateTimelineEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid timeline entry id', 400);
  }

  if (!comment || comment.trim() === '') {
    throw new CustomError('Comment is required', 400);
  }

  const timelineEntry = await GiftCardTimelineModel.findByIdAndUpdate(
    id,
    { comment: comment.trim() },
    { new: true, runValidators: true }
  );

  if (!timelineEntry) {
    throw new CustomError('Timeline entry not found', 404);
  }

  res.status(200).json({
    success: true,
    data: timelineEntry,
    message: 'Timeline entry updated successfully'
  });
});

// Delete timeline entry
export const deleteTimelineEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid timeline entry id', 400);
  }

  const timelineEntry = await GiftCardTimelineModel.findByIdAndDelete(id);

  if (!timelineEntry) {
    throw new CustomError('Timeline entry not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      deletedTimelineEntry: {
        id: timelineEntry._id,
        type: timelineEntry.type,
        comment: timelineEntry.comment
      }
    },
    message: 'Timeline entry deleted successfully'
  });
});
