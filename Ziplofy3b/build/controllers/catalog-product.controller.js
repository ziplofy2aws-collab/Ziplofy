"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCatalogProductVariant = exports.getCatalogProductsByCatalogId = exports.deleteCatalogProduct = exports.createCatalogProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catalog_product_model_1 = require("../models/catalog-product/catalog-product.model");
const catalog_product_variant_model_1 = require("../models/catalog-product-variant/catalog-product-variant.model");
const error_utils_1 = require("../utils/error.utils");
const product_model_1 = require("../models/product/product.model");
const product_variants_model_1 = require("../models/product/product-variants.model");
// POST /catalog-products
exports.createCatalogProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { catalogId, productId, isManuallyAdded } = req.body;
    if (!catalogId || !mongoose_1.default.isValidObjectId(catalogId))
        throw new error_utils_1.CustomError('Valid catalogId is required', 400);
    if (!productId || !mongoose_1.default.isValidObjectId(productId))
        throw new error_utils_1.CustomError('Valid productId is required', 400);
    // Ensure product exists before proceeding
    const baseProduct = await product_model_1.Product.findById(productId).select({ _id: 1, title: 1, imageUrls: 1, compareAtPrice: 1, price: 1 }).lean();
    if (!baseProduct)
        throw new error_utils_1.CustomError('Product not found', 404);
    const created = await catalog_product_model_1.CatalogProduct.create({ catalogId, productId, isManuallyAdded: isManuallyAdded ?? true, price: baseProduct.price, compareAtPrice: baseProduct.compareAtPrice });
    // Create CatalogProductVariant entries for all variants of this product in this catalog
    const productVariants = await product_variants_model_1.ProductVariant.find({ productId })
        .select({ _id: 1, productId: 1, price: 1, compareAtPrice: 1 })
        .lean();
    if (productVariants.length > 0) {
        const variantDocs = productVariants.map((v) => ({
            catalogId,
            productId,
            variantId: v._id,
            price: v.price,
            compareAtPrice: v.compareAtPrice ?? undefined,
        }));
        // Best-effort insert; uniqueness on (catalogId, variantId) prevents duplicates
        await catalog_product_variant_model_1.CatalogProductVariant.insertMany(variantDocs, { ordered: false });
    }
    // Build response from CatalogProduct + CatalogProductVariant (enrich with base product + variant display fields)
    const cp = await catalog_product_model_1.CatalogProduct.findById(created._id).lean();
    const cpvs = await catalog_product_variant_model_1.CatalogProductVariant.find({ catalogId, productId }).lean();
    const variantIds = cpvs.map((v) => v.variantId);
    const pvDocs = variantIds.length
        ? await product_variants_model_1.ProductVariant.find({ _id: { $in: variantIds } })
            .select({ _id: 1, sku: 1, images: 1, optionValues: 1 })
            .lean()
        : [];
    const pvMap = {};
    for (const v of pvDocs)
        pvMap[String(v._id)] = v;
    const enriched = {
        _id: cp?._id,
        catalogId: cp?.catalogId,
        productId: cp?.productId,
        isManuallyAdded: cp?.isManuallyAdded ?? true,
        createdAt: cp?.createdAt,
        updatedAt: cp?.updatedAt,
        product: baseProduct
            ? {
                _id: baseProduct._id,
                title: baseProduct.title || '',
                imageUrl: baseProduct.imageUrls && baseProduct.imageUrls.length
                    ? baseProduct.imageUrls[0]
                    : null,
                price: cp?.price ?? null,
                compareAtPrice: cp?.compareAtPrice ?? null,
            }
            : null,
        variants: cpvs.map((cv) => {
            const pv = pvMap[String(cv.variantId)] || {};
            return {
                _id: cv.variantId,
                sku: pv.sku || '',
                imageUrl: pv.images && pv.images.length ? pv.images[0] : null,
                optionValues: pv.optionValues || {},
                price: cv?.price ?? null,
                compareAtPrice: cv?.compareAtPrice ?? null,
            };
        }),
    };
    return res.status(201).json({ success: true, data: enriched, message: 'Catalog product created' });
});
// DELETE /catalog-products/:id
exports.deleteCatalogProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const deleted = await catalog_product_model_1.CatalogProduct.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Catalog product not found', 404);
    // Cascade delete catalog product variants for this catalog/product
    await catalog_product_variant_model_1.CatalogProductVariant.deleteMany({ catalogId: deleted.catalogId, productId: deleted.productId });
    return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Catalog product deleted' });
});
// GET /catalog-products/catalog/:catalogId
exports.getCatalogProductsByCatalogId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { catalogId } = req.params;
    if (!catalogId || !mongoose_1.default.isValidObjectId(catalogId))
        throw new error_utils_1.CustomError('Valid catalogId is required', 400);
    // 1) Fetch catalog products
    const catalogProducts = await catalog_product_model_1.CatalogProduct.find({ catalogId }).sort({ createdAt: -1 }).lean();
    if (catalogProducts.length === 0) {
        return res.status(200).json({ success: true, data: [], message: 'Catalog products fetched' });
    }
    // 2) Fetch catalog product variants for these products within this catalog
    const productIds = [...new Set(catalogProducts.map((cp) => String(cp.productId)))];
    const catalogProductVariants = await catalog_product_variant_model_1.CatalogProductVariant.find({ catalogId, productId: { $in: productIds } }).lean();
    // 3) Populate base product docs for display fields
    const products = await product_model_1.Product.find({ _id: { $in: productIds } })
        .select({ _id: 1, title: 1, imageUrls: 1 })
        .lean();
    const productIdToProduct = {};
    for (const p of products)
        productIdToProduct[String(p._id)] = p;
    // 4) Populate base variant docs for display fields
    const variantIds = [...new Set(catalogProductVariants.map((v) => String(v.variantId)))];
    const variantDocs = variantIds.length
        ? await product_variants_model_1.ProductVariant.find({ _id: { $in: variantIds } })
            .select({ _id: 1, sku: 1, images: 1, optionValues: 1 })
            .lean()
        : [];
    const variantIdToVariant = {};
    for (const v of variantDocs)
        variantIdToVariant[String(v._id)] = v;
    // 5) Group CPVs by productId to compose response easily
    const productIdToCpvs = {};
    for (const cv of catalogProductVariants) {
        const key = String(cv.productId);
        if (!productIdToCpvs[key])
            productIdToCpvs[key] = [];
        const pv = variantIdToVariant[String(cv.variantId)] || {};
        productIdToCpvs[key].push({
            _id: cv.variantId,
            sku: pv.sku || '',
            imageUrl: pv.images && pv.images.length ? pv.images[0] : null,
            optionValues: pv.optionValues || {},
            // price fields are stored on CPV; expose later if needed on frontend types
            // price: cv.price,
            // compareAtPrice: cv.compareAtPrice,
        });
    }
    // 6) Compose final response per catalog product
    const data = catalogProducts.map((cp) => {
        const p = productIdToProduct[String(cp.productId)] || null;
        const pv = productIdToCpvs[String(cp.productId)] || [];
        return {
            _id: cp._id,
            catalogId: cp.catalogId,
            productId: cp.productId,
            isManuallyAdded: cp.isManuallyAdded,
            createdAt: cp.createdAt,
            updatedAt: cp.updatedAt,
            product: p
                ? {
                    _id: p._id,
                    title: p.title || '',
                    imageUrl: p.imageUrls && p.imageUrls.length ? p.imageUrls[0] : null,
                    price: cp?.price ?? null,
                    compareAtPrice: cp?.compareAtPrice ?? null,
                }
                : null,
            variants: pv.map((v) => ({
                ...v,
                // include cpv price fields by matching variantId
                price: (() => {
                    const match = catalogProductVariants.find((cv) => String(cv.variantId) === String(v._id) && String(cv.productId) === String(cp.productId));
                    return match?.price ?? null;
                })(),
                compareAtPrice: (() => {
                    const match = catalogProductVariants.find((cv) => String(cv.variantId) === String(v._id) && String(cv.productId) === String(cp.productId));
                    return match?.compareAtPrice ?? null;
                })(),
            })),
        };
    });
    return res.status(200).json({ success: true, data, message: 'Catalog products fetched' });
});
// PUT /catalog-products/variant/:id
exports.updateCatalogProductVariant = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const { price, compareAtPrice } = req.body;
    const update = {};
    if (typeof price === 'number')
        update.price = price;
    if (typeof compareAtPrice === 'number')
        update.compareAtPrice = compareAtPrice;
    if (Object.keys(update).length === 0)
        throw new error_utils_1.CustomError('Nothing to update', 400);
    const updated = await catalog_product_variant_model_1.CatalogProductVariant.findByIdAndUpdate(id, update, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Catalog product variant not found', 404);
    return res.status(200).json({
        success: true,
        data: {
            price: updated?.price ?? null,
            compareAtPrice: updated?.compareAtPrice ?? null,
        },
        message: 'Catalog product variant updated',
    });
});
