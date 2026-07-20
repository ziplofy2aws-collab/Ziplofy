import { Request, Response } from "express";
import mongoose from "mongoose";
import { CustomerTimeline, ICustomerTimeline } from "../models/customer/customer-timeline/customer-timeline.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create a new customer timeline entry
export const createCustomerTimeline = asyncErrorHandler(async (req: Request, res: Response) => {
  const { customerId, comment } = req.body as Pick<ICustomerTimeline, "customerId" | "comment">;

  // Validate required fields
  if (!customerId || !comment) {
    throw new CustomError("Customer ID and comment are required", 400);
  }

  // Validate customerId format
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new CustomError("Invalid customer ID format", 400);
  }

  // Create new timeline entry
  const timelineEntry = new CustomerTimeline({
    customerId,
    comment: comment.trim()
  });

  const savedTimelineEntry = await timelineEntry.save();

  res.status(201).json({
    success: true,
    message: "Customer timeline entry created successfully",
    data: savedTimelineEntry
  });
});

// Update a customer timeline entry
export const updateCustomerTimeline = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment } = req.body as Pick<ICustomerTimeline, "comment">;

  // Validate timeline entry ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid timeline entry ID format", 400);
  }

  // Validate comment
  if (!comment || comment.trim().length === 0) {
    throw new CustomError("Comment is required", 400);
  }

  // Find and update the timeline entry
  const timelineEntry = await CustomerTimeline.findByIdAndUpdate(
    id,
    { comment: comment.trim() },
    { new: true, runValidators: true }
  );

  if (!timelineEntry) {
    throw new CustomError("Timeline entry not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Customer timeline entry updated successfully",
    data: timelineEntry
  });
});

// Delete a customer timeline entry
export const deleteCustomerTimeline = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate timeline entry ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid timeline entry ID format", 400);
  }

  // Find and delete the timeline entry
  const timelineEntry = await CustomerTimeline.findByIdAndDelete(id);

  if (!timelineEntry) {
    throw new CustomError("Timeline entry not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Customer timeline entry deleted successfully",
    data: {
      deletedTimelineEntry: {
        id: timelineEntry._id,
        customerId: timelineEntry.customerId,
        comment: timelineEntry.comment
      }
    }
  });
});

// Get customer timeline entries by customer ID
export const getCustomerTimelineEntriesByCustomerId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { customerId } = req.params;

  // Validate customer ID format
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new CustomError("Invalid customer ID format", 400);
  }

  // Find customer timeline entries by customer ID
  const timelineEntries = await CustomerTimeline.find({ customerId });

  res.status(200).json({
    success: true,
    message: "Customer timeline entries retrieved successfully",
    data: timelineEntries,
    count: timelineEntries.length,
  });
}); 