"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStore = exports.getStoresByUserParam = exports.getStoresByUserId = exports.createStore = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const general_settings_model_1 = require("../models/general-settings/general-settings.model");
const notification_settings_model_1 = require("../models/notification-settings/notification-settings.model");
const location_model_1 = require("../models/location/location.model");
const store_custom_theme_model_1 = require("../models/store-custom-theme/store-custom-theme.model");
const store_model_1 = require("../models/store/store.model");
const subdomain_model_1 = require("../models/subdomain.model");
const error_utils_1 = require("../utils/error.utils");
// Create a new store
exports.createStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeName, storeDescription } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    // Check duplicate by store name for this user (case-insensitive)
    const existingStore = await store_model_1.Store.findOne({
        userId,
        storeName: { $regex: new RegExp(`^${storeName}$`, 'i') }
    });
    if (existingStore) {
        throw new error_utils_1.CustomError("A store with this name already exists for this user", 400);
    }
    const store = await store_model_1.Store.create({
        userId,
        storeName,
        storeDescription,
    });
    // Create default general settings for the store
    await general_settings_model_1.GeneralSettings.create({
        storeId: store._id,
        storeName: store.storeName,
        storeEmail: req.user?.email || '',
    });
    await notification_settings_model_1.NotificationSettings.create({
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
                await subdomain_model_1.Subdomain.create({ storeId: store._id, subdomain });
                created = true;
            }
            catch (err) {
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
    }
    catch (e) {
        console.error('Unexpected error while creating store subdomain:', e);
    }
    // Create a default location for this store and set reference
    const defaultLocation = await location_model_1.LocationModel.create({
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
    store.defaultLocation = defaultLocation._id;
    await store.save();
    res.status(201).json({
        success: true,
        data: store,
        message: "Store created successfully",
    });
});
// Get all stores for authenticated user
exports.getStoresByUserId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const userId = req.user?.id;
    const stores = await store_model_1.Store.find({ userId });
    res.status(200).json({
        success: true,
        data: stores,
        count: stores.length,
    });
});
// Get stores for a specific user (super-admin or support-admin only)
exports.getStoresByUserParam = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { userId } = req.params;
    const userRole = req.user?.role;
    const isSuperAdmin = req.user?.superAdmin;
    const isSupportAdmin = userRole?.toLowerCase() === "support-admin";
    if (!isSuperAdmin && !isSupportAdmin) {
        throw new error_utils_1.CustomError("Only super-admin or support-admin can view another user's stores", 403);
    }
    if (!userId) {
        throw new error_utils_1.CustomError("User ID is required", 400);
    }
    const stores = await store_model_1.Store.find({ userId }).lean();
    res.status(200).json({
        success: true,
        data: stores,
        count: stores.length,
    });
});
// Update a store
exports.updateStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const body = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Store id is required", 400);
    }
    const $set = {};
    if (body.storeName !== undefined) {
        $set.storeName = body.storeName;
    }
    if (body.storeDescription !== undefined) {
        $set.storeDescription = body.storeDescription;
    }
    if (body.defaultLocation !== undefined) {
        if (body.defaultLocation === null || body.defaultLocation === "") {
            $set.defaultLocation = null;
        }
        else {
            if (!mongoose_1.default.isValidObjectId(body.defaultLocation)) {
                throw new error_utils_1.CustomError("Invalid default location ID", 400);
            }
            $set.defaultLocation = new mongoose_1.default.Types.ObjectId(body.defaultLocation);
        }
    }
    if (body.appliedCustomThemeId !== undefined) {
        if (body.appliedCustomThemeId === null || body.appliedCustomThemeId === "") {
            $set.appliedCustomThemeId = null;
        }
        else {
            if (!mongoose_1.default.isValidObjectId(body.appliedCustomThemeId)) {
                throw new error_utils_1.CustomError("Invalid custom theme ID", 400);
            }
            const customTheme = await store_custom_theme_model_1.StoreCustomTheme.findOne({
                _id: body.appliedCustomThemeId,
                storeId: id,
            })
                .select("_id")
                .lean();
            if (!customTheme) {
                throw new error_utils_1.CustomError("Store custom theme not found for this store", 404);
            }
            $set.appliedCustomThemeId = new mongoose_1.default.Types.ObjectId(body.appliedCustomThemeId);
        }
    }
    if (Object.keys($set).length === 0) {
        throw new error_utils_1.CustomError("No valid fields to update", 400);
    }
    const store = await store_model_1.Store.findOneAndUpdate({ _id: id, userId }, { $set }, {
        new: true,
        runValidators: true,
    });
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    res.status(200).json({
        success: true,
        data: store,
        message: "Store updated successfully",
    });
});
