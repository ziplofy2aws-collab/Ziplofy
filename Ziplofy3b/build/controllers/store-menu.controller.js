"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoreMenuItem = exports.updateStoreMenuItem = exports.createStoreMenuItem = exports.deleteStoreMenu = exports.updateStoreMenu = exports.getStoreMenuItemsByMenuId = exports.getStoreMenuById = exports.getStoreMenusByStoreId = exports.createStoreMenu = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const store_menu_model_1 = require("../models/store-menu/store-menu.model");
const store_menu_item_model_1 = require("../models/store-menu-item/store-menu-item.model");
const collections_model_1 = require("../models/collections/collections.model");
const product_model_1 = require("../models/product/product.model");
const store_menu_link_util_1 = require("../utils/store-menu-link.util");
async function assertMenuBelongsToStore(menuId, storeId) {
    if (!mongoose_1.default.isValidObjectId(menuId)) {
        throw new error_utils_1.CustomError("Valid menu id is required", 400);
    }
    const menu = await store_menu_model_1.StoreMenu.findById(menuId).lean();
    if (!menu)
        throw new error_utils_1.CustomError("Menu not found", 404);
    if (String(menu.storeId) !== String(storeId)) {
        throw new error_utils_1.CustomError("Menu does not belong to this store", 403);
    }
    return menu;
}
async function validateAndNormalizeMenuItems(storeId, items) {
    if (!Array.isArray(items)) {
        throw new error_utils_1.CustomError("items must be an array", 400);
    }
    const normalized = [];
    for (let index = 0; index < items.length; index++) {
        const row = items[index];
        const label = row?.label?.trim();
        const linkType = row?.linkType;
        if (!label)
            throw new error_utils_1.CustomError(`Item at index ${index}: label is required`, 400);
        if (!linkType || !store_menu_item_model_1.MENU_ITEM_LINK_TYPES.includes(linkType)) {
            throw new error_utils_1.CustomError(`Item at index ${index}: invalid linkType`, 400);
        }
        const position = typeof row.position === "number" && row.position >= 0 ? row.position : index;
        if (linkType === "specific-collection") {
            const collectionId = row.collectionId;
            if (!collectionId || !mongoose_1.default.isValidObjectId(collectionId)) {
                throw new error_utils_1.CustomError(`Item at index ${index}: collectionId is required for specific-collection`, 400);
            }
            const collection = await collections_model_1.Collections.findOne({ _id: collectionId, storeId }).select("_id").lean();
            if (!collection) {
                throw new error_utils_1.CustomError(`Item at index ${index}: collection not found for this store`, 400);
            }
            normalized.push({
                label,
                linkType,
                collectionId: new mongoose_1.default.Types.ObjectId(collectionId),
                position,
            });
            continue;
        }
        if (linkType === "specific-product") {
            const productId = row.productId;
            if (!productId || !mongoose_1.default.isValidObjectId(productId)) {
                throw new error_utils_1.CustomError(`Item at index ${index}: productId is required for specific-product`, 400);
            }
            const product = await product_model_1.Product.findOne({
                _id: productId,
                storeId,
                isDeleted: { $ne: true },
            })
                .select("_id")
                .lean();
            if (!product) {
                throw new error_utils_1.CustomError(`Item at index ${index}: product not found for this store`, 400);
            }
            normalized.push({
                label,
                linkType,
                productId: new mongoose_1.default.Types.ObjectId(productId),
                position,
            });
            continue;
        }
        if (linkType === "custom") {
            const link = row.link?.trim();
            if (!link) {
                throw new error_utils_1.CustomError(`Item at index ${index}: link is required for custom`, 400);
            }
            normalized.push({ label, linkType, link, position });
            continue;
        }
        normalized.push({ label, linkType, position });
    }
    return normalized;
}
async function enrichMenuItemsWithHref(items) {
    const collectionIds = items
        .filter((i) => i.linkType === "specific-collection" && i.collectionId)
        .map((i) => i.collectionId);
    const productIds = items
        .filter((i) => i.linkType === "specific-product" && i.productId)
        .map((i) => i.productId);
    const [collections, products] = await Promise.all([
        collectionIds.length
            ? collections_model_1.Collections.find({ _id: { $in: collectionIds } }).select("_id urlHandle title").lean()
            : [],
        productIds.length
            ? product_model_1.Product.find({ _id: { $in: productIds } }).select("_id urlHandle title").lean()
            : [],
    ]);
    const collectionById = new Map(collections.map((c) => [String(c._id), c]));
    const productById = new Map(products.map((p) => [String(p._id), p]));
    return items.map((item) => {
        const collection = item.linkType === "specific-collection" && item.collectionId
            ? collectionById.get(String(item.collectionId)) ?? null
            : null;
        const product = item.linkType === "specific-product" && item.productId
            ? productById.get(String(item.productId)) ?? null
            : null;
        return {
            ...item,
            href: (0, store_menu_link_util_1.resolveStoreMenuItemHref)({
                linkType: item.linkType,
                link: item.link,
                collectionId: collection,
                productId: product,
            }),
            collection: collection ?? undefined,
            product: product ?? undefined,
        };
    });
}
exports.createStoreMenu = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, menuName, handle: handleRaw, items = [] } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!menuName?.trim()) {
        throw new error_utils_1.CustomError("menuName is required", 400);
    }
    const handle = (handleRaw?.trim() || (0, store_menu_link_util_1.slugifyMenuHandle)(menuName)).toLowerCase();
    const normalizedItems = await validateAndNormalizeMenuItems(storeId, items);
    const existing = await store_menu_model_1.StoreMenu.findOne({ storeId, handle }).select("_id").lean();
    if (existing) {
        throw new error_utils_1.CustomError("A menu with this handle already exists for this store", 409);
    }
    const session = await mongoose_1.default.startSession();
    let menu;
    try {
        await session.withTransaction(async () => {
            const created = await store_menu_model_1.StoreMenu.create([{ storeId, menuName: menuName.trim(), handle }], { session });
            menu = created[0];
            if (normalizedItems.length > 0) {
                await store_menu_item_model_1.StoreMenuItem.insertMany(normalizedItems.map((item) => ({
                    menuId: menu._id,
                    ...item,
                })), { session, ordered: true });
            }
        });
    }
    finally {
        await session.endSession();
    }
    const savedItems = await store_menu_item_model_1.StoreMenuItem.find({ menuId: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(savedItems);
    res.status(201).json({
        success: true,
        data: { menu, items: enrichedItems },
        message: "Menu created successfully",
    });
});
exports.getStoreMenusByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const menus = await store_menu_model_1.StoreMenu.find({ storeId }).sort({ createdAt: -1 }).lean();
    const menuIds = menus.map((m) => m._id);
    const items = menuIds.length > 0
        ? await store_menu_item_model_1.StoreMenuItem.find({ menuId: { $in: menuIds } })
            .sort({ position: 1 })
            .select("menuId label linkType")
            .lean()
        : [];
    const labelsByMenuId = new Map();
    for (const item of items) {
        const key = String(item.menuId);
        if (!labelsByMenuId.has(key))
            labelsByMenuId.set(key, []);
        labelsByMenuId
            .get(key)
            .push((0, store_menu_link_util_1.menuItemListSummaryLabel)(item.linkType, item.label));
    }
    const data = menus.map((menu) => {
        const itemLabels = labelsByMenuId.get(String(menu._id)) ?? [];
        return {
            ...menu,
            itemLabels,
            menuItemsSummary: itemLabels.join(", "),
        };
    });
    res.status(200).json({ success: true, data, count: data.length });
});
exports.getStoreMenuById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid menu id is required", 400);
    }
    const menu = await store_menu_model_1.StoreMenu.findById(id).lean();
    if (!menu)
        throw new error_utils_1.CustomError("Menu not found", 404);
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(menu.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Menu does not belong to this store", 403);
        }
    }
    const items = await store_menu_item_model_1.StoreMenuItem.find({ menuId: id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(items);
    res.status(200).json({
        success: true,
        data: { menu, items: enrichedItems },
    });
});
exports.getStoreMenuItemsByMenuId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { menuId } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(menuId)) {
        throw new error_utils_1.CustomError("Valid menuId is required", 400);
    }
    const menu = await store_menu_model_1.StoreMenu.findById(menuId).lean();
    if (!menu)
        throw new error_utils_1.CustomError("Menu not found", 404);
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(menu.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Menu does not belong to this store", 403);
        }
    }
    const items = await store_menu_item_model_1.StoreMenuItem.find({ menuId }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(items);
    res.status(200).json({ success: true, data: enrichedItems, count: enrichedItems.length });
});
exports.updateStoreMenu = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { menuName, handle: handleRaw, items } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid menu id is required", 400);
    }
    const menu = await store_menu_model_1.StoreMenu.findById(id);
    if (!menu)
        throw new error_utils_1.CustomError("Menu not found", 404);
    if (menuName?.trim())
        menu.menuName = menuName.trim();
    if (handleRaw?.trim())
        menu.handle = handleRaw.trim().toLowerCase();
    if (menu.isModified("menuName") && !handleRaw?.trim()) {
        menu.handle = (0, store_menu_link_util_1.slugifyMenuHandle)(menu.menuName);
    }
    if (menu.isModified("handle")) {
        const conflict = await store_menu_model_1.StoreMenu.findOne({
            storeId: menu.storeId,
            handle: menu.handle,
            _id: { $ne: menu._id },
        })
            .select("_id")
            .lean();
        if (conflict) {
            throw new error_utils_1.CustomError("A menu with this handle already exists for this store", 409);
        }
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await menu.save({ session });
            if (Array.isArray(items)) {
                const normalizedItems = await validateAndNormalizeMenuItems(String(menu.storeId), items);
                await store_menu_item_model_1.StoreMenuItem.deleteMany({ menuId: menu._id }, { session });
                if (normalizedItems.length > 0) {
                    await store_menu_item_model_1.StoreMenuItem.insertMany(normalizedItems.map((item) => ({
                        menuId: menu._id,
                        ...item,
                    })), { session, ordered: true });
                }
            }
        });
    }
    finally {
        await session.endSession();
    }
    const savedItems = await store_menu_item_model_1.StoreMenuItem.find({ menuId: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(savedItems);
    res.status(200).json({
        success: true,
        data: { menu: menu.toObject(), items: enrichedItems },
        message: "Menu updated successfully",
    });
});
exports.deleteStoreMenu = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid menu id is required", 400);
    }
    const menu = await store_menu_model_1.StoreMenu.findById(id);
    if (!menu)
        throw new error_utils_1.CustomError("Menu not found", 404);
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await store_menu_item_model_1.StoreMenuItem.deleteMany({ menuId: menu._id }, { session });
            await menu.deleteOne({ session });
        });
    }
    finally {
        await session.endSession();
    }
    res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: "Menu deleted successfully",
    });
});
exports.createStoreMenuItem = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { menuId } = req.params;
    const { storeId, ...itemBody } = req.body;
    if (!mongoose_1.default.isValidObjectId(menuId)) {
        throw new error_utils_1.CustomError("Valid menuId is required", 400);
    }
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    await assertMenuBelongsToStore(menuId, storeId);
    const [normalized] = await validateAndNormalizeMenuItems(storeId, [itemBody]);
    const created = await store_menu_item_model_1.StoreMenuItem.create({
        menuId,
        ...normalized,
    });
    const [enriched] = await enrichMenuItemsWithHref([created.toObject()]);
    res.status(201).json({
        success: true,
        data: enriched,
        message: "Menu item created successfully",
    });
});
exports.updateStoreMenuItem = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, ...itemBody } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid menu item id is required", 400);
    }
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const existing = await store_menu_item_model_1.StoreMenuItem.findById(id);
    if (!existing)
        throw new error_utils_1.CustomError("Menu item not found", 404);
    await assertMenuBelongsToStore(String(existing.menuId), storeId);
    const merged = {
        label: itemBody.label ?? existing.label,
        linkType: itemBody.linkType ?? existing.linkType,
        link: itemBody.link ?? existing.link,
        collectionId: itemBody.collectionId ?? (existing.collectionId ? String(existing.collectionId) : undefined),
        productId: itemBody.productId ?? (existing.productId ? String(existing.productId) : undefined),
        position: itemBody.position ?? existing.position,
    };
    const [normalized] = await validateAndNormalizeMenuItems(storeId, [merged]);
    existing.label = normalized.label;
    existing.linkType = normalized.linkType;
    existing.link = normalized.link;
    existing.collectionId = normalized.collectionId;
    existing.productId = normalized.productId;
    existing.position = normalized.position;
    await existing.save();
    const [enriched] = await enrichMenuItemsWithHref([existing.toObject()]);
    res.status(200).json({
        success: true,
        data: enriched,
        message: "Menu item updated successfully",
    });
});
exports.deleteStoreMenuItem = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid menu item id is required", 400);
    }
    const item = await store_menu_item_model_1.StoreMenuItem.findById(id);
    if (!item)
        throw new error_utils_1.CustomError("Menu item not found", 404);
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        await assertMenuBelongsToStore(String(item.menuId), storeId);
    }
    await item.deleteOne();
    res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: "Menu item deleted successfully",
    });
});
