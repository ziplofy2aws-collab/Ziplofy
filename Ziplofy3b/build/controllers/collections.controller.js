"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductsInCollection = exports.searchCollections = exports.deleteCollection = exports.updateCollection = exports.getCollectionById = exports.getCollectionsByStoreId = exports.createCollection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const collections_model_1 = require("../models/collections/collections.model");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const product_model_1 = require("../models/product/product.model");
const cloud_storage_image_util_1 = require("../utils/cloud-storage-image.util");
const sanitize_html_util_1 = require("../utils/sanitize-html.util");
const store_access_util_1 = require("../utils/store-access.util");
const COLLECTION_UPDATE_FIELDS = [
    "title",
    "imageUrl",
    "imageAltText",
    "description",
    "pageTitle",
    "metaDescription",
    "urlHandle",
    "productSort",
    "status",
];
const ALLOWED_SORTS = ["manual", "title-asc", "title-desc", "price-high", "price-low", "newest", "oldest"];
function buildCollectionUpdatePayload(body) {
    const updatePayload = {};
    for (const field of COLLECTION_UPDATE_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(body, field))
            continue;
        updatePayload[field] = body[field];
    }
    return updatePayload;
}
async function getCollectionOrThrow(id) {
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid collection id is required", 400);
    }
    const collection = await collections_model_1.Collections.findById(id).select("storeId");
    if (!collection) {
        throw new error_utils_1.CustomError("Collection not found", 404);
    }
    return collection;
}
function validateCollectionStatus(status) {
    if (typeof status !== "undefined" && status !== "draft" && status !== "published") {
        throw new error_utils_1.CustomError("Invalid status. Allowed values are 'draft' or 'published'", 400);
    }
}
function validateProductSort(productSort) {
    if (typeof productSort !== "undefined" && !ALLOWED_SORTS.includes(productSort)) {
        throw new error_utils_1.CustomError("Invalid productSort value", 400);
    }
}
// Create a new collection
exports.createCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, title, imageUrl, imageAltText, description, pageTitle, metaDescription, urlHandle, productIds, productSort, status, } = req.body;
    if (!storeId || !title || !description || !pageTitle || !metaDescription || !urlHandle) {
        throw new error_utils_1.CustomError("Missing required fields", 400);
    }
    await (0, store_access_util_1.assertStoreAccess)(storeId.toString(), req.user);
    validateCollectionStatus(status);
    validateProductSort(productSort);
    const sanitizedDescription = (0, sanitize_html_util_1.sanitizeRichTextHtml)(String(description));
    await (0, cloud_storage_image_util_1.assertOptionalStoreCloudImageUrl)(storeId.toString(), imageUrl);
    const normalizedProductIds = Array.isArray(productIds)
        ? [...new Set(productIds.filter((id) => typeof id === "string" && mongoose_1.default.isValidObjectId(id)))]
        : [];
    if (Array.isArray(productIds) && normalizedProductIds.length !== productIds.length) {
        throw new error_utils_1.CustomError("One or more productIds are invalid", 400);
    }
    if (normalizedProductIds.length > 0) {
        const existingProducts = await product_model_1.Product.find({
            _id: { $in: normalizedProductIds },
            storeId,
            isDeleted: { $ne: true },
        })
            .select({ _id: 1 })
            .lean();
        if (existingProducts.length !== normalizedProductIds.length) {
            throw new error_utils_1.CustomError("One or more selected products are invalid for this store", 400);
        }
    }
    const session = await mongoose_1.default.startSession();
    let collection;
    try {
        await session.withTransaction(async () => {
            const created = await collections_model_1.Collections.create([
                {
                    storeId,
                    title,
                    imageUrl,
                    imageAltText,
                    description: sanitizedDescription,
                    pageTitle,
                    metaDescription,
                    urlHandle,
                    ...(typeof productSort !== "undefined" ? { productSort } : {}),
                    ...(typeof status !== "undefined" ? { status } : {}),
                },
            ], { session });
            collection = created[0];
            if (normalizedProductIds.length > 0) {
                await collection_entry_model_1.CollectionEntry.insertMany(normalizedProductIds.map((productId, index) => ({
                    collectionId: collection._id,
                    productId,
                    position: index + 1,
                })), { session, ordered: false });
            }
        });
    }
    finally {
        await session.endSession();
    }
    res.status(201).json({ success: true, data: collection, message: "Collection created successfully" });
});
// Get collections by store id
exports.getCollectionsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    await (0, store_access_util_1.assertStoreAccess)(storeId, req.user);
    const collections = await collections_model_1.Collections.find({ storeId }).sort({ createdAt: -1 }).lean();
    if (collections.length === 0) {
        res.status(200).json({ success: true, data: [], count: 0 });
        return;
    }
    const collectionIds = collections.map((collection) => collection._id);
    const productCounts = await collection_entry_model_1.CollectionEntry.aggregate([
        { $match: { collectionId: { $in: collectionIds } } },
        { $group: { _id: "$collectionId", count: { $sum: 1 } } },
    ]);
    const countByCollectionId = new Map(productCounts.map((entry) => [String(entry._id), entry.count]));
    const data = collections.map((collection) => ({
        ...collection,
        productCount: countByCollectionId.get(String(collection._id)) ?? 0,
    }));
    res.status(200).json({ success: true, data, count: data.length });
});
// Get collection by id
exports.getCollectionById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid collection id is required", 400);
    }
    const collection = await collections_model_1.Collections.findById(id).lean();
    if (!collection) {
        throw new error_utils_1.CustomError("Collection not found", 404);
    }
    await (0, store_access_util_1.assertStoreAccess)(collection.storeId.toString(), req.user);
    const productCount = await collection_entry_model_1.CollectionEntry.countDocuments({ collectionId: collection._id });
    res.status(200).json({
        success: true,
        data: {
            ...collection,
            productCount,
        },
    });
});
// Update collection
exports.updateCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const existing = await getCollectionOrThrow(id);
    const storeId = existing.storeId.toString();
    await (0, store_access_util_1.assertStoreAccess)(storeId, req.user);
    const updatePayload = buildCollectionUpdatePayload(req.body);
    if (!Object.keys(updatePayload).length) {
        throw new error_utils_1.CustomError("No valid fields provided to update", 400);
    }
    validateCollectionStatus(updatePayload.status);
    validateProductSort(updatePayload.productSort);
    if (Object.prototype.hasOwnProperty.call(updatePayload, "description")) {
        updatePayload.description = (0, sanitize_html_util_1.sanitizeRichTextHtml)(String(updatePayload.description ?? ""));
    }
    if (Object.prototype.hasOwnProperty.call(updatePayload, "imageUrl")) {
        await (0, cloud_storage_image_util_1.assertOptionalStoreCloudImageUrl)(storeId, updatePayload.imageUrl);
    }
    const updated = await collections_model_1.Collections.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    if (!updated)
        throw new error_utils_1.CustomError("Collection not found", 404);
    res.status(200).json({ success: true, data: updated, message: "Collection updated successfully" });
});
// Delete collection
exports.deleteCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const existing = await getCollectionOrThrow(id);
    await (0, store_access_util_1.assertStoreAccess)(existing.storeId.toString(), req.user);
    const deleted = await collections_model_1.Collections.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError("Collection not found", 404);
    res.status(200).json({ success: true, data: { deletedId: id }, message: "Collection deleted successfully" });
});
// Search collections with fuzzy search
exports.searchCollections = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { q, page = 1, limit = 10 } = req.query;
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    if (!q || typeof q !== "string")
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    await (0, store_access_util_1.assertStoreAccess)(storeId, req.user);
    const skip = (Number(page) - 1) * Number(limit);
    const searchCriteria = {
        storeId,
        title: { $regex: q, $options: "i" },
    };
    const collections = await collections_model_1.Collections.find(searchCriteria)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    const collectionsWithProductCount = await Promise.all(collections.map(async (collection) => {
        const productCount = await collection_entry_model_1.CollectionEntry.countDocuments({
            collectionId: collection._id,
        });
        return {
            ...collection,
            productCount,
        };
    }));
    const totalCollections = await collections_model_1.Collections.countDocuments(searchCriteria);
    res.status(200).json({
        success: true,
        data: collectionsWithProductCount,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalCollections / Number(limit)),
            totalItems: totalCollections,
            itemsPerPage: Number(limit),
        },
    });
});
exports.searchProductsInCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { collectionId } = req.params;
    const { q, page = 1, limit = 10 } = req.query;
    if (!collectionId || !mongoose_1.default.isValidObjectId(collectionId)) {
        throw new error_utils_1.CustomError("Valid collectionId is required", 400);
    }
    if (!q || typeof q !== "string") {
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    }
    const collection = await getCollectionOrThrow(collectionId);
    await (0, store_access_util_1.assertStoreAccess)(collection.storeId.toString(), req.user);
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const rx = new RegExp(q.trim(), "i");
    const productIds = await collection_entry_model_1.CollectionEntry.find({ collectionId })
        .distinct("productId");
    if (productIds.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: {
                currentPage: pageNum,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: limitNum,
            },
        });
    }
    const filter = {
        _id: { $in: productIds },
        isDeleted: { $ne: true },
        $or: [{ title: rx }, { sku: rx }],
    };
    const [products, total] = await Promise.all([
        product_model_1.Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select({ title: 1, sku: 1, imageUrls: 1, vendor: 1, productType: 1, createdAt: 1 })
            .lean(),
        product_model_1.Product.countDocuments(filter),
    ]);
    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
        },
    });
});
