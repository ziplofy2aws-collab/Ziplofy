import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  ContactFormSubmission,
  CONTACT_FORM_SUBMISSION_STATUS,
  type ContactFormSubmissionStatus,
} from "../models/contact-form-submission/contact-form-submission.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

function assertValidObjectId(value: string, label: string): void {
  if (!value || !mongoose.isValidObjectId(value)) {
    throw new CustomError(`Valid ${label} is required`, 400);
  }
}

function normalizeStatus(value: unknown): ContactFormSubmissionStatus {
  if (
    typeof value === "string" &&
    CONTACT_FORM_SUBMISSION_STATUS.includes(value as ContactFormSubmissionStatus)
  ) {
    return value as ContactFormSubmissionStatus;
  }
  throw new CustomError("Invalid submission status", 400);
}

function trimFields(body: Record<string, unknown>) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    message:
      typeof body.message === "string"
        ? body.message.trim()
        : typeof body.comment === "string"
          ? body.comment.trim()
          : "",
  };
}

/** Admin: list contact form submissions for a store (optional status filter). */
export const getContactFormSubmissionsByStoreId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const { status } = req.query as Record<string, string>;

    assertValidObjectId(storeId, "storeId");

    const store = await Store.findById(storeId).select("_id").lean();
    if (!store) {
      throw new CustomError("Store not found", 404);
    }

    const filter: Record<string, unknown> = { storeId };
    if (status?.trim()) {
      filter.status = normalizeStatus(status);
    }

    const submissions = await ContactFormSubmission.find(filter).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: submissions,
      count: submissions.length,
    });
  }
);

/** Storefront: visitor submits a contact form message. */
export const createStorefrontContactFormSubmission = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.body as { storeId?: string };
    const { name, email, phone, message } = trimFields(req.body as Record<string, unknown>);

    assertValidObjectId(String(storeId ?? ""), "storeId");

    if (!name) throw new CustomError("Name is required", 400);
    if (!email) throw new CustomError("Email is required", 400);
    if (!message) throw new CustomError("Message is required", 400);

    const store = await Store.findById(storeId).select("_id").lean();
    if (!store) {
      throw new CustomError("Store not found", 404);
    }

    const submission = await ContactFormSubmission.create({
      storeId,
      name,
      email,
      phone: phone || undefined,
      message,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        _id: submission._id,
        name: submission.name,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    });
  }
);
