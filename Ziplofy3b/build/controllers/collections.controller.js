"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductsInCollection = exports.searchCollections = exports.deleteCollection = exports.updateCollection = exports.getCollectionsByStoreId = exports.createCollection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const collections_model_1 = require("../models/collections/collections.model");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const product_model_1 = require("../models/product/product.model");
// Create a new collection
exports.createCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, title, imageUrl, imageAltText, description, pageTitle, metaDescription, urlHandle, productIds, productSort, status, } = req.body;
    if (!storeId || !title || !description || !pageTitle || !metaDescription || !urlHandle) {
        throw new error_utils_1.CustomError("Missing required fields", 400);
    }
    // Optional status validation
    if (typeof status !== 'undefined' && status !== 'draft' && status !== 'published') {
        throw new error_utils_1.CustomError("Invalid status. Allowed values are 'draft' or 'published'", 400);
    }
    const allowedSorts = ['manual', 'title-asc', 'title-desc', 'price-high', 'price-low', 'newest', 'oldest'];
    if (typeof productSort !== 'undefined' && !allowedSorts.includes(productSort)) {
        throw new error_utils_1.CustomError("Invalid productSort value", 400);
    }
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
                    description,
                    pageTitle,
                    metaDescription,
                    urlHandle,
                    ...(typeof productSort !== 'undefined' ? { productSort } : {}),
                    ...(typeof status !== 'undefined' ? { status } : {}),
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
    const collections = await collections_model_1.Collections.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: collections, count: collections.length });
});
// Update collection
exports.updateCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const update = req.body;
    const updated = await collections_model_1.Collections.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated)
        throw new error_utils_1.CustomError("Collection not found", 404);
    res.status(200).json({ success: true, data: updated, message: "Collection updated successfully" });
});
// Delete collection
exports.deleteCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
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
    if (!q || typeof q !== 'string')
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    const skip = (Number(page) - 1) * Number(limit);
    // Simple fuzzy search on collection names
    const searchCriteria = {
        storeId,
        title: { $regex: q, $options: 'i' }
    };
    // Get collections with pagination
    const collections = await collections_model_1.Collections.find(searchCriteria)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    // Get product counts for each collection
    const collectionsWithProductCount = await Promise.all(collections.map(async (collection) => {
        const productCount = await collection_entry_model_1.CollectionEntry.countDocuments({
            collectionId: collection._id
        });
        return {
            ...collection,
            productCount
        };
    }));
    // Get total count for pagination
    const totalCollections = await collections_model_1.Collections.countDocuments(searchCriteria);
    res.status(200).json({
        success: true,
        data: collectionsWithProductCount,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalCollections / Number(limit)),
            totalItems: totalCollections,
            itemsPerPage: Number(limit)
        }
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
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const rx = new RegExp(q.trim(), "i");
    // Get product ids in the collection
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
        $or: [
            { title: rx },
            { sku: rx },
        ],
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
