"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductsInCollection = exports.searchCollections = exports.deleteCollection = exports.updateCollection = exports.duplicateCollection = exports.getCollectionThemeTemplates = exports.getCollectionsByStoreId = exports.createCollection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const collections_model_1 = require("../models/collections/collections.model");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const product_model_1 = require("../models/product/product.model");
const collection_theme_template_util_1 = require("../utils/collection-theme-template.util");
const MAX_TITLE_LENGTH = 200;
const MAX_URL_HANDLE_LENGTH = 100;
function buildDuplicateTitle(title) {
    const base = title.trim() || "Collection";
    const duplicateTitle = base.toLowerCase().startsWith("copy of ") ? base : `Copy of ${base}`;
    return duplicateTitle.slice(0, MAX_TITLE_LENGTH);
}
function normalizeUrlHandleCandidate(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, MAX_URL_HANDLE_LENGTH);
}
async function generateDuplicateUrlHandle(storeId, sourceHandle) {
    const normalizedSource = normalizeUrlHandleCandidate(sourceHandle) || "collection";
    const rootHandle = normalizedSource.replace(/-copy(-\d+)?$/, "") || "collection";
    let attempt = 1;
    while (attempt <= 1000) {
        const suffix = attempt === 1 ? "-copy" : `-copy-${attempt}`;
        const maxRootLength = Math.max(1, MAX_URL_HANDLE_LENGTH - suffix.length);
        const candidate = `${rootHandle.slice(0, maxRootLength)}${suffix}`;
        const existing = await collections_model_1.Collections.findOne({ storeId, urlHandle: candidate }).select({ _id: 1 }).lean();
        if (!existing)
            return candidate;
        attempt += 1;
    }
    throw new error_utils_1.CustomError("Unable to generate a unique URL handle for the duplicated collection", 409);
}
// Create a new collection
exports.createCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, title, imageUrl, imageAltText, description, pageTitle, metaDescription, urlHandle, productIds, productSort, status, themeTemplate, } = req.body;
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
    if (typeof themeTemplate !== 'undefined' && !(0, collection_theme_template_util_1.isValidCollectionThemeTemplate)(themeTemplate)) {
        throw new error_utils_1.CustomError("Invalid themeTemplate value", 400);
    }
    const normalizedThemeTemplate = typeof themeTemplate !== 'undefined'
        ? (0, collection_theme_template_util_1.normalizeCollectionThemeTemplate)(themeTemplate)
        : undefined;
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
                    ...(normalizedThemeTemplate ? { themeTemplate: normalizedThemeTemplate } : {}),
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
// Get available collection theme templates for a store
exports.getCollectionThemeTemplates = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const templates = await (0, collection_theme_template_util_1.listCollectionThemeTemplatesForStore)(storeId);
    res.status(200).json({ success: true, data: templates, count: templates.length });
});
// Duplicate collection
exports.duplicateCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid collection id is required", 400);
    }
    const source = await collections_model_1.Collections.findById(id).lean();
    if (!source) {
        throw new error_utils_1.CustomError("Collection not found", 404);
    }
    const entries = await collection_entry_model_1.CollectionEntry.find({ collectionId: source._id })
        .sort({ position: 1, createdAt: 1 })
        .select({ productId: 1, position: 1 })
        .lean();
    const duplicateTitle = buildDuplicateTitle(source.title);
    const duplicatePageTitle = buildDuplicateTitle(source.pageTitle || source.title);
    const duplicateUrlHandle = await generateDuplicateUrlHandle(source.storeId, source.urlHandle);
    const session = await mongoose_1.default.startSession();
    let duplicated;
    try {
        await session.withTransaction(async () => {
            const created = await collections_model_1.Collections.create([
                {
                    storeId: source.storeId,
                    title: duplicateTitle,
                    imageUrl: source.imageUrl,
                    imageAltText: source.imageAltText,
                    description: source.description,
                    pageTitle: duplicatePageTitle,
                    metaDescription: source.metaDescription,
                    urlHandle: duplicateUrlHandle,
                    productSort: source.productSort,
                    themeTemplate: source.themeTemplate ?? "default",
                    status: "draft",
                },
            ], { session });
            duplicated = created[0];
            if (entries.length > 0) {
                await collection_entry_model_1.CollectionEntry.insertMany(entries.map((entry, index) => ({
                    collectionId: duplicated._id,
                    productId: entry.productId,
                    position: typeof entry.position === "number" ? entry.position : index + 1,
                })), { session, ordered: false });
            }
        });
    }
    finally {
        await session.endSession();
    }
    res.status(201).json({
        success: true,
        data: duplicated,
        message: "Collection duplicated successfully",
    });
});
// Update collection
exports.updateCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const update = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(update, "themeTemplate")) {
        if (!(0, collection_theme_template_util_1.isValidCollectionThemeTemplate)(update.themeTemplate)) {
            throw new error_utils_1.CustomError("Invalid themeTemplate value", 400);
        }
        update.themeTemplate = (0, collection_theme_template_util_1.normalizeCollectionThemeTemplate)(update.themeTemplate);
    }
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
