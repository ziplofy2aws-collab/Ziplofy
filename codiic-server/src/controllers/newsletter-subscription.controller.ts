import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  NewsletterSubscription,
  NEWSLETTER_SUBSCRIPTION_STATUS,
  type NewsletterSubscriptionStatus,
} from "../models/newsletter-subscription/newsletter-subscription.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

function assertValidObjectId(value: string, label: string): void {
  if (!value || !mongoose.isValidObjectId(value)) {
    throw new CustomError(`Valid ${label} is required`, 400);
  }
}

function normalizeStatus(value: unknown): NewsletterSubscriptionStatus {
  if (
    typeof value === "string" &&
    NEWSLETTER_SUBSCRIPTION_STATUS.includes(value as NewsletterSubscriptionStatus)
  ) {
    return value as NewsletterSubscriptionStatus;
  }
  throw new CustomError("Invalid subscription status", 400);
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/** Admin: list newsletter subscriptions for a store (optional status filter). */
export const getNewsletterSubscriptionsByStoreId = asyncErrorHandler(
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

    const subscriptions = await NewsletterSubscription.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    });
  }
);

/** Storefront: visitor subscribes to the newsletter. */
export const createStorefrontNewsletterSubscription = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.body as { storeId?: string };
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    assertValidObjectId(String(storeId ?? ""), "storeId");

    if (!email) throw new CustomError("Email is required", 400);
    if (!EMAIL_REGEX.test(email)) {
      throw new CustomError("Please provide a valid email address", 400);
    }

    const store = await Store.findById(storeId).select("_id").lean();
    if (!store) {
      throw new CustomError("Store not found", 404);
    }

    const existing = await NewsletterSubscription.findOne({ storeId, email });

    if (existing) {
      if (existing.status === "subscribed") {
        res.status(200).json({
          success: true,
          message: "You are already subscribed to our newsletter",
          data: {
            _id: existing._id,
            email: existing.email,
            status: existing.status,
            subscribedAt: existing.subscribedAt,
          },
        });
        return;
      }

      const updated = await NewsletterSubscription.findByIdAndUpdate(
        existing._id,
        {
          $set: {
            status: "subscribed",
            subscribedAt: new Date(),
          },
          $unset: { unsubscribedAt: 1 },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Successfully re-subscribed to our newsletter",
        data: {
          _id: updated!._id,
          email: updated!.email,
          status: updated!.status,
          subscribedAt: updated!.subscribedAt,
        },
      });
      return;
    }

    const subscription = await NewsletterSubscription.create({
      storeId,
      email,
      status: "subscribed",
      subscribedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to our newsletter",
      data: {
        _id: subscription._id,
        email: subscription.email,
        status: subscription.status,
        subscribedAt: subscription.subscribedAt,
      },
    });
  }
);
