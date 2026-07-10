import { Request, Response } from "express";
import mongoose from "mongoose";
import { GeneralSettings } from "../models/general-settings/general-settings.model";
import { NotificationSettings } from "../models/notification-settings/notification-settings.model";
import { LocationModel } from "../models/location/location.model";
import { StoreCustomTheme } from "../models/store-custom-theme/store-custom-theme.model";
import { IStore, Store } from "../models/store/store.model";
import { Subdomain } from "../models/subdomain.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create a new store
export const createStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeName, storeDescription } = req.body as Pick<IStore, "storeName" | "storeDescription">;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  // Check duplicate by store name for this user (case-insensitive)
  const existingStore = await Store.findOne({ 
    userId, 
    storeName: { $regex: new RegExp(`^${storeName}$`, 'i') }
  });
  if (existingStore) {
    throw new CustomError("A store with this name already exists for this user", 400);
  }

  const store = await Store.create({
    userId,
    storeName,
    storeDescription,
  });

  // Create default general settings for the store
  await GeneralSettings.create({
    storeId: store._id,
    storeName: store.storeName,
    storeEmail: req.user?.email || '',
  });

  await NotificationSettings.create({
    storeId: store._id,
    senderEmail: req.user?.email || '',
  });

  // Create default subdomain mapping for this store with a short retry on collisions
  try {
    const base = (storeName || 'store')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'store';
    let attempts = 0;
    let created = false;
    while (!created && attempts < 5) {
      const suffix = Math.random().toString(36).slice(2, 6);
      const subdomain = `${base}-${suffix}`;
      try {
        await Subdomain.create({ storeId: store._id, subdomain });
        created = true;
      } catch (err: any) {
        // Duplicate subdomain or unique constraint error: retry with new suffix
        if (err && err.code === 11000) {
          attempts += 1;
          continue;
        }
        // Other errors: log and break
        console.error('Failed to create store subdomain:', err);
        break;
      }
    }
  } catch (e) {
    console.error('Unexpected error while creating store subdomain:', e);
  }

  // Create a default location for this store and set reference
  const defaultLocation = await LocationModel.create({
    storeId: store._id,
    name: 'Default Location',
    countryRegion: 'United States',
    address: '123 Default Street',
    apartment: '',
    city: 'Default City',
    state: 'CA',
    postalCode: '00000',
    phone: '+1-000-000-0000',
    canShip: true,
    canLocalDeliver: false,
    canPickup: true,
    isDefault: true,
    isFulfillmentAllowed: true,
    isActive: true,
  });
  store.defaultLocation = defaultLocation._id as any;
  await store.save();

  res.status(201).json({
    success: true,
    data: store,
    message: "Store created successfully",
  });
});

// Get all stores for authenticated user
export const getStoresByUserId = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const stores = await Store.find({ userId });

  res.status(200).json({
    success: true,
    data: stores,
    count: stores.length,
  });
});

// Get stores for a specific user (super-admin or support-admin only)
export const getStoresByUserParam = asyncErrorHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };
  const userRole = (req.user as any)?.role;
  const isSuperAdmin = (req.user as any)?.superAdmin;
  const isSupportAdmin = userRole?.toLowerCase() === "support-admin";

  if (!isSuperAdmin && !isSupportAdmin) {
    throw new CustomError("Only super-admin or support-admin can view another user's stores", 403);
  }

  if (!userId) {
    throw new CustomError("User ID is required", 400);
  }

  const stores = await Store.find({ userId }).lean();

  res.status(200).json({
    success: true,
    data: stores,
    count: stores.length,
  });
});

// Update a store
export const updateStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const body = req.body as Partial<Pick<IStore, "storeName" | "storeDescription">> & {
    defaultLocation?: string | null;
    appliedCustomThemeId?: string | null;
  };

  if (!id) {
    throw new CustomError("Store id is required", 400);
  }

  const $set: Record<string, unknown> = {};

  if (body.storeName !== undefined) {
    $set.storeName = body.storeName;
  }
  if (body.storeDescription !== undefined) {
    $set.storeDescription = body.storeDescription;
  }
  if (body.defaultLocation !== undefined) {
    if (body.defaultLocation === null || body.defaultLocation === "") {
      $set.defaultLocation = null;
    } else {
      if (!mongoose.isValidObjectId(body.defaultLocation)) {
        throw new CustomError("Invalid default location ID", 400);
      }
      $set.defaultLocation = new mongoose.Types.ObjectId(body.defaultLocation);
    }
  }
  if (body.appliedCustomThemeId !== undefined) {
    if (body.appliedCustomThemeId === null || body.appliedCustomThemeId === "") {
      $set.appliedCustomThemeId = null;
    } else {
      if (!mongoose.isValidObjectId(body.appliedCustomThemeId)) {
        throw new CustomError("Invalid custom theme ID", 400);
      }
      const customTheme = await StoreCustomTheme.findOne({
        _id: body.appliedCustomThemeId,
        storeId: id,
      })
        .select("_id")
        .lean();
      if (!customTheme) {
        throw new CustomError("Store custom theme not found for this store", 404);
      }
      $set.appliedCustomThemeId = new mongoose.Types.ObjectId(body.appliedCustomThemeId);
    }
  }

  if (Object.keys($set).length === 0) {
    throw new CustomError("No valid fields to update", 400);
  }

  const store = await Store.findOneAndUpdate({ _id: id, userId }, { $set }, {
    new: true,
    runValidators: true,
  });

  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  res.status(200).json({
    success: true,
    data: store,
    message: "Store updated successfully",
  });
});
