import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models';
import { OrderTimelineModel } from '../models/order/order-timeline.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

export const createOrderTimelineEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { orderId, comment, type } = req.body as {
    orderId?: string;
    comment?: string;
    type?: 'comment' | 'event';
  };

  if (!orderId || !comment?.trim()) {
    throw new CustomError('orderId and comment are required', 400);
  }

  if (!mongoose.isValidObjectId(orderId)) {
    throw new CustomError('Invalid orderId', 400);
  }

  const order = await Order.findById(orderId).select('_id').lean();
  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  const resolvedType = type === 'event' ? 'event' : 'comment';

  const timelineEntry = await OrderTimelineModel.create({
    orderId,
    type: resolvedType,
    comment: comment.trim(),
  });

  res.status(201).json({
    success: true,
    data: timelineEntry,
    message: 'Order timeline entry created successfully',
  });
});

export const getOrderTimelineByOrderId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new CustomError('orderId is required', 400);
  }

  if (!mongoose.isValidObjectId(orderId)) {
    throw new CustomError('Invalid orderId', 400);
  }

  const order = await Order.findById(orderId).select('_id').lean();
  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  const timelineEntries = await OrderTimelineModel.find({ orderId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: timelineEntries,
    count: timelineEntries.length,
  });
});

export const updateOrderTimelineEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment } = req.body as { comment?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid timeline entry id', 400);
  }

  if (!comment?.trim()) {
    throw new CustomError('Comment is required', 400);
  }

  const timelineEntry = await OrderTimelineModel.findByIdAndUpdate(
    id,
    { comment: comment.trim() },
    { new: true, runValidators: true }
  );

  if (!timelineEntry) {
    throw new CustomError('Order timeline entry not found', 404);
  }

  res.status(200).json({
    success: true,
    data: timelineEntry,
    message: 'Order timeline entry updated successfully',
  });
});

export const deleteOrderTimelineEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid timeline entry id', 400);
  }

  const timelineEntry = await OrderTimelineModel.findByIdAndDelete(id);

  if (!timelineEntry) {
    throw new CustomError('Order timeline entry not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      deletedTimelineEntry: {
        id: timelineEntry._id,
        orderId: timelineEntry.orderId,
        type: timelineEntry.type,
        comment: timelineEntry.comment,
      },
    },
    message: 'Order timeline entry deleted successfully',
  });
});
