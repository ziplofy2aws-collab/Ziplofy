import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreCheckoutConfiguration } from '../models/store-checkout-configuration/store-checkout-configuration.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

function parseCheckoutConfig(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined) {
    throw new CustomError('checkoutConfig is required', 400);
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new CustomError('checkoutConfig must be a JSON object', 400);
  }
  return raw as Record<string, unknown>;
}

export const createStoreCheckoutConfiguration = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId, checkoutConfig } = req.body as {
      storeId?: string;
      checkoutConfig?: unknown;
    };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    const existing = await StoreCheckoutConfiguration.findOne({ storeId }).lean();
    if (existing) {
      throw new CustomError('Checkout configuration already exists for this store', 409);
    }

    const config = parseCheckoutConfig(checkoutConfig ?? {});

    const created = await StoreCheckoutConfiguration.create({
      storeId,
      checkoutConfig: config,
    });

    res.status(201).json({
      success: true,
      message: 'Store checkout configuration created',
      data: created,
    });
  }
);

export const getStoreCheckoutConfigurationByStoreId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId?: string };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    const doc = await StoreCheckoutConfiguration.findOne({ storeId }).lean();

    res.status(200).json({
      success: true,
      message: doc
        ? 'Store checkout configuration retrieved'
        : 'No checkout configuration found for this store',
      data: doc,
    });
  }
);

export const getStoreCheckoutConfigurationById = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id?: string };

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new CustomError('Valid id is required', 400);
    }

    const doc = await StoreCheckoutConfiguration.findById(id).lean();

    if (!doc) {
      throw new CustomError('Store checkout configuration not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Store checkout configuration retrieved',
      data: doc,
    });
  }
);

export const updateStoreCheckoutConfiguration = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id?: string };
    const { checkoutConfig } = req.body as { checkoutConfig?: unknown };

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new CustomError('Valid id is required', 400);
    }

    if (checkoutConfig === undefined) {
      throw new CustomError('checkoutConfig is required to update', 400);
    }

    const updated = await StoreCheckoutConfiguration.findByIdAndUpdate(
      id,
      { $set: { checkoutConfig: parseCheckoutConfig(checkoutConfig) } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new CustomError('Store checkout configuration not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Store checkout configuration updated',
      data: updated,
    });
  }
);

export const deleteStoreCheckoutConfiguration = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id?: string };

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new CustomError('Valid id is required', 400);
    }

    const deleted = await StoreCheckoutConfiguration.findByIdAndDelete(id);

    if (!deleted) {
      throw new CustomError('Store checkout configuration not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Store checkout configuration deleted',
      data: { deletedId: id },
    });
  }
);
