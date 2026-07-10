"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsInCollection = exports.getProductsInCollectionByUrlHandle = exports.getCollectionDetailsByUrlHandle = exports.getCollectionsByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const collections_model_1 = require("../models/collections/collections.model");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const product_model_1 = require("../models/product/product.model");
const models_1 = require("../models");
const public_origin_util_1 = require("../utils/public-origin.util");
function normalizeUrlHandle(raw) {
    return raw.trim().toLowerCase();
}
function assertValidStoreId(storeId) {
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
}
// Get collections by store id
exports.getCollectionsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    const collections = await collections_model_1.Collections.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: collections, count: collections.length });
});
/** Storefront: resolve a published collection by store + url handle. */
exports.getCollectionDetailsByUrlHandle = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, urlHandle } = req.params;
    assertValidStoreId(storeId);
    if (!urlHandle?.trim())
        throw new error_utils_1.CustomError("urlHandle is required", 400);
    const collection = await collections_model_1.Collections.findOne({
        storeId,
        urlHandle: normalizeUrlHandle(urlHandle),
        status: "published",
    }).lean();
    if (!collection) {
        throw new error_utils_1.CustomError("Collection not found", 404);
    }
    const productCount = await collection_entry_model_1.CollectionEntry.countDocuments({ collectionId: collection._id });
    res.status(200).json({
        success: true,
        data: { ...collection, productCount },
    });
});
async function sendStorefrontCollectionProductsResponse(req, res, collectionId, storeId) {
    const { page = 1, limit = 12, q } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;
    const productIds = await collection_entry_model_1.CollectionEntry.find({ collectionId })
        .distinct("productId");
    if (productIds.length === 0) {
        res.status(200).json({
            success: true,
            data: [],
            pagination: { currentPage: pageNum, totalPages: 0, totalItems: 0, itemsPerPage: limitNum },
            orderDiscount: null,
        });
        return;
    }
    const filter = { _id: { $in: productIds }, isDeleted: { $ne: true } };
    if (q && typeof q === "string") {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ title: rx }, { sku: rx }];
    }
    const [products, total] = await Promise.all([
        product_model_1.Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select({
            title: 1,
            description: 1,
            category: 1,
            price: 1,
            compareAtPrice: 1,
            sku: 1,
            status: 1,
            vendor: 1,
            imageUrls: 1,
            createdAt: 1,
            updatedAt: 1,
        })
            .populate({ path: "vendor", select: "name" })
            .populate({ path: "category", select: "name" })
            .lean(),
        product_model_1.Product.countDocuments(filter),
    ]);
    const now = new Date();
    const nowDateStr = now.toISOString().split("T")[0];
    const nowTimeStr = now.toISOString().split("T")[1].substring(0, 5);
    const isDiscountActive = (d) => {
        if (d.startDate && d.startDate > nowDateStr)
            return false;
        if (d.startDate === nowDateStr && d.startTime && d.startTime > nowTimeStr)
            return false;
        if (!d.setEndDate || !d.endDate)
            return true;
        if (d.endDate > nowDateStr)
            return true;
        if (d.endDate === nowDateStr && d.endTime && d.endTime >= nowTimeStr)
            return true;
        if (d.endDate === nowDateStr && !d.endTime)
            return true;
        return false;
    };
    const activeProductDiscounts = await models_1.AmountOffProductsDiscount.find({
        storeId,
        status: "active",
    }).lean();
    const validProductDiscounts = activeProductDiscounts.filter(isDiscountActive);
    const productDiscountIds = validProductDiscounts.map((d) => d._id);
    const productDiscountEntries = productDiscountIds.length > 0
        ? await models_1.AmountOffProductsEntry.find({
            storeId,
            discountId: { $in: productDiscountIds },
        }).lean()
        : [];
    const entriesByDiscount = new Map();
    for (const entry of productDiscountEntries) {
        const key = String(entry.discountId);
        if (!entriesByDiscount.has(key))
            entriesByDiscount.set(key, []);
        entriesByDiscount.get(key).push(entry);
    }
    const collectionIdsInEntries = productDiscountEntries
        .filter((e) => e.collectionId)
        .map((e) => e.collectionId);
    const collectionProductMap = new Map();
    if (collectionIdsInEntries.length > 0) {
        const collectionEntries = await collection_entry_model_1.CollectionEntry.find({
            collectionId: { $in: collectionIdsInEntries },
        }).lean();
        for (const ce of collectionEntries) {
            const colKey = String(ce.collectionId);
            if (!collectionProductMap.has(colKey))
                collectionProductMap.set(colKey, []);
            collectionProductMap.get(colKey).push(String(ce.productId));
        }
    }
    const productDiscountMap = new Map();
    for (const discount of validProductDiscounts) {
        const discountId = String(discount._id);
        const entries = entriesByDiscount.get(discountId) || [];
        const applicableProductIds = [];
        for (const entry of entries) {
            if (entry.productId) {
                applicableProductIds.push(String(entry.productId));
            }
            else if (entry.collectionId) {
                const productsInCollection = collectionProductMap.get(String(entry.collectionId)) || [];
                applicableProductIds.push(...productsInCollection);
            }
        }
        for (const productId of applicableProductIds) {
            const existing = productDiscountMap.get(productId);
            const newDiscount = {
                valueType: discount.valueType,
                percentage: discount.percentage,
                fixedAmount: discount.fixedAmount,
                title: discount.title,
                method: discount.method,
                discountCode: discount.discountCode,
            };
            if (!existing) {
                productDiscountMap.set(productId, newDiscount);
            }
            else {
                const existingValue = existing.valueType === "percentage" ? existing.percentage || 0 : existing.fixedAmount || 0;
                const newValue = newDiscount.valueType === "percentage" ? newDiscount.percentage || 0 : newDiscount.fixedAmount || 0;
                if (existing.valueType === newDiscount.valueType) {
                    if (newValue > existingValue) {
                        productDiscountMap.set(productId, newDiscount);
                    }
                }
                else if (newDiscount.valueType === "fixed-amount" && newValue > existingValue) {
                    productDiscountMap.set(productId, newDiscount);
                }
            }
        }
    }
    const activeOrderDiscounts = await models_1.AmountOffOrderDiscount.find({
        storeId,
        status: "active",
        method: "automatic",
    }).lean();
    const validOrderDiscounts = activeOrderDiscounts.filter(isDiscountActive);
    let bestOrderDiscount = null;
    for (const discount of validOrderDiscounts) {
        const d = discount;
        const newDiscount = {
            valueType: d.valueType,
            percentage: d.percentage,
            fixedAmount: d.fixedAmount,
            title: d.title,
            minimumPurchase: d.minimumPurchase,
            minimumAmount: d.minimumAmount,
            minimumQuantity: d.minimumQuantity,
        };
        if (!bestOrderDiscount) {
            bestOrderDiscount = newDiscount;
        }
        else {
            const existingValue = bestOrderDiscount.valueType === "percentage"
                ? bestOrderDiscount.percentage || 0
                : bestOrderDiscount.fixedAmount || 0;
            const newValue = newDiscount.valueType === "percentage" ? newDiscount.percentage || 0 : newDiscount.fixedAmount || 0;
            if (newValue > existingValue) {
                bestOrderDiscount = newDiscount;
            }
        }
    }
    const publicOrigin = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const enrichedProducts = products.map((product) => {
        const productId = String(product._id);
        const discount = productDiscountMap.get(productId);
        return {
            ...product,
            imageUrls: (0, public_origin_util_1.absolutizeImageUrlsArray)(publicOrigin, product.imageUrls),
            productDiscount: discount || null,
        };
    });
    res.status(200).json({
        success: true,
        data: enrichedProducts,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
        },
        orderDiscount: bestOrderDiscount,
    });
}
// Get products inside a collection by url handle (storefront)
exports.getProductsInCollectionByUrlHandle = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, urlHandle } = req.params;
    assertValidStoreId(storeId);
    if (!urlHandle?.trim())
        throw new error_utils_1.CustomError("urlHandle is required", 400);
    const collection = await collections_model_1.Collections.findOne({
        storeId,
        urlHandle: normalizeUrlHandle(urlHandle),
        status: "published",
    })
        .select("_id storeId")
        .lean();
    if (!collection) {
        throw new error_utils_1.CustomError("Collection not found", 404);
    }
    await sendStorefrontCollectionProductsResponse(req, res, collection._id, collection.storeId);
});
// Get products inside a collection by id (legacy storefront)
exports.getProductsInCollection = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { collectionId } = req.params;
    if (!collectionId || !mongoose_1.default.isValidObjectId(collectionId)) {
        throw new error_utils_1.CustomError("Valid collectionId is required", 400);
    }
    const collection = await collections_model_1.Collections.findById(collectionId).select("storeId").lean();
    if (!collection) {
        throw new error_utils_1.CustomError("Collection not found", 404);
    }
    await sendStorefrontCollectionProductsResponse(req, res, collection._id, collection.storeId);
});
