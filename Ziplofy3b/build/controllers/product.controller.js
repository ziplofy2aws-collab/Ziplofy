"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteProductById = exports.searchProductsWithVariantAndDestination = exports.searchProductsWithVariants = exports.searchProductsBasic = exports.searchProductsWithAvailability = exports.addOptionToProduct = exports.deleteVariantsFromProduct = exports.addVariantsToProduct = exports.getProductByIdPublic = exports.getProductById = exports.getProductsByStoreIdPublic = exports.getProductsByStoreId = exports.updateProductById = exports.createProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inventory_level_model_1 = require("../models/inventory-level/inventory-level.model");
const location_model_1 = require("../models/location/location.model");
const product_variants_model_1 = require("../models/product/product-variants.model");
const product_model_1 = require("../models/product/product.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
const models_1 = require("../models");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const public_origin_util_1 = require("../utils/public-origin.util");
// Create a new product
exports.createProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    // Parse and type the incoming payload; allow extra fields but prefer strong typing for known ones
    const body = req.body;
    // Guard against missing critical product attributes; database schema will also enforce constraints
    if (!body.title || !body.description || !body.category || !body.storeId || body.price === undefined) {
        throw new error_utils_1.CustomError("Missing required fields: title, description, category, storeId, price", 400);
    }
    // Normalize input variants/units to internal representation when needed
    //@ts-ignore
    if (body.productWeightUnit === "grams") {
        body.productWeightUnit = "g";
    }
    // Normalize images if client sent "images" instead of "imageUrls"
    body.imageUrls = body.images ?? [];
    // Shipping fields are optional; keep the controller lean and rely on schema defaults
    // 1) Create the base Product document first; variants (combinations) are created separately below
    let product;
    try {
        product = await product_model_1.Product.create({
            title: body.title,
            storeId: body.storeId,
            description: body.description,
            category: body.category,
            price: body.price,
            compareAtPrice: body.compareAtPrice,
            chargeTax: body.chargeTax ?? true,
            cost: body.cost ?? 0,
            profit: body.profit ?? 0,
            marginPercent: body.marginPercent ?? 0,
            unitPriceTotalAmount: body.unitPriceTotalAmount,
            unitPriceTotalAmountMetric: body.unitPriceTotalAmountMetric,
            unitPriceBaseMeasure: body.unitPriceBaseMeasure,
            unitPriceBaseMeasureMetric: body.unitPriceBaseMeasureMetric,
            inventoryTrackingEnabled: body.inventoryTrackingEnabled ?? true,
            continueSellingWhenOutOfStock: body.continueSellingWhenOutOfStock ?? false,
            sku: body.sku,
            barcode: body.barcode,
            isPhysicalProduct: body.isPhysicalProduct ?? true,
            package: body.package,
            productWeight: body.productWeight,
            productWeightUnit: body.productWeightUnit,
            countryOfOrigin: body.countryOfOrigin,
            harmonizedSystemCode: body.harmonizedSystemCode,
            variants: body.variants ?? [], // [{ optionName, values }]
            pageTitle: body.pageTitle,
            metaDescription: body.metaDescription,
            urlHandle: body.urlHandle,
            status: body.status ?? 'draft',
            onlineStorePublishing: body.onlineStorePublishing ?? true,
            pointOfSalePublishing: body.pointOfSalePublishing ?? false,
            productType: body.productType,
            vendor: body.vendor,
            tagIds: body.tagIds ?? [],
            imageUrls: body.imageUrls ?? [],
        });
    }
    catch (error) {
        throw new error_utils_1.CustomError("We couldn't create the product. Please verify the product details and try again.", 400);
    }
    // 2) Generate ProductVariant docs
    // If variant dimensions are provided (e.g., color/size), create the cartesian combinations.
    // Otherwise, create a single synthetic default variant to represent a mono-variant product.
    const baseSku = body.sku || (body.title ? body.title.replace(/\s+/g, '-').toUpperCase() : 'SKU');
    let variantDocs = [];
    if (Array.isArray(body.variants) && body.variants.length > 0) {
        // Build the axes from declared options and compute cartesian product
        const optionDefs = body.variants
            .filter((opt) => opt && Array.isArray(opt.values) && opt.values.length > 0)
            .map((opt) => ({ name: opt.optionName, values: opt.values }));
        if (optionDefs.length === 0) {
            throw new error_utils_1.CustomError("Please add at least one valid option value for each variant option.", 400);
        }
        const combos = optionDefs.reduce((acc, opt) => {
            if (acc.length === 0)
                return opt.values.map((v) => [v]);
            const next = [];
            for (const prev of acc) {
                for (const v of opt.values)
                    next.push([...prev, v]);
            }
            return next;
        }, []);
        if (combos.length === 0) {
            throw new error_utils_1.CustomError("Unable to generate variants from the provided options. Please review option values.", 400);
        }
        variantDocs = combos.map((vals, idx) => {
            // Map the Nth value in the combo back to the Nth option name (e.g., Color->Red, Size->M)
            const optionValues = new Map();
            optionDefs.forEach((opt, i) => optionValues.set(opt.name, vals[i]));
            return {
                productId: product._id,
                optionValues,
                sku: `${baseSku}-${idx + 1}`,
                barcode: body.barcode || null,
                price: typeof body.price === 'number' ? body.price : 0,
                compareAtPrice: typeof body.compareAtPrice === 'number' ? body.compareAtPrice : null,
                cost: typeof body.cost === 'number' ? body.cost : null,
                profit: typeof body.profit === 'number' ? body.profit : null,
                marginPercent: typeof body.marginPercent === 'number' ? body.marginPercent : null,
                weightValue: typeof body.productWeight === 'number' ? body.productWeight : 0,
                weightUnit: body.productWeightUnit || 'kg',
                package: body.package,
                countryOfOrigin: body.countryOfOrigin || null,
                hsCode: body.harmonizedSystemCode || null,
                images: Array.isArray(body.imageUrls) ? body.imageUrls : (body.imageUrl ? [body.imageUrl] : []),
                unitPriceTotalAmount: body.unitPriceTotalAmount ?? undefined,
                unitPriceTotalAmountMetric: body.unitPriceTotalAmountMetric ?? undefined,
                unitPriceBaseMeasure: body.unitPriceBaseMeasure ?? undefined,
                unitPriceBaseMeasureMetric: body.unitPriceBaseMeasureMetric ?? undefined,
                chargeTax: body.chargeTax ?? true,
                outOfStockContinueSelling: !!body.continueSellingWhenOutOfStock,
                isInventoryTrackingEnabled: true,
                isPhysicalProduct: body.isPhysicalProduct ?? true,
                isSynthetic: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                depricated: false,
            };
        });
    }
    else {
        // No variant dimensions provided: create a single synthetic default variant
        variantDocs = [{
                productId: product._id,
                optionValues: new Map(),
                sku: `${baseSku}-1`,
                barcode: body.barcode || null,
                price: typeof body.price === 'number' ? body.price : 0,
                compareAtPrice: typeof body.compareAtPrice === 'number' ? body.compareAtPrice : null,
                cost: typeof body.cost === 'number' ? body.cost : null,
                profit: typeof body.profit === 'number' ? body.profit : null,
                marginPercent: typeof body.marginPercent === 'number' ? body.marginPercent : null,
                weightValue: typeof body.productWeight === 'number' ? body.productWeight : 0,
                weightUnit: body.productWeightUnit || 'kg',
                package: body.package,
                countryOfOrigin: body.countryOfOrigin || null,
                hsCode: body.harmonizedSystemCode || null,
                images: Array.isArray(body.imageUrls) ? body.imageUrls : (body.imageUrl ? [body.imageUrl] : []),
                unitPriceTotalAmount: body.unitPriceTotalAmount ?? undefined,
                unitPriceTotalAmountMetric: body.unitPriceTotalAmountMetric ?? undefined,
                unitPriceBaseMeasure: body.unitPriceBaseMeasure ?? undefined,
                unitPriceBaseMeasureMetric: body.unitPriceBaseMeasureMetric ?? undefined,
                chargeTax: body.chargeTax ?? true,
                outOfStockContinueSelling: !!body.continueSellingWhenOutOfStock,
                isInventoryTrackingEnabled: true,
                isPhysicalProduct: body.isPhysicalProduct ?? true,
                isSynthetic: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                depricated: false,
            }];
    }
    // 3) Persist variants, then initialize inventory levels across all store locations
    if (variantDocs.length > 0) {
        let createdVariants = [];
        try {
            createdVariants = await product_variants_model_1.ProductVariant.insertMany(variantDocs);
        }
        catch (error) {
            throw new error_utils_1.CustomError("Product was created, but creating its variants failed. Please try again.", 500);
        }
        // Always create inventory levels for all variants across all locations
        let locations = [];
        try {
            locations = await location_model_1.LocationModel.find({ storeId: body.storeId }).select('_id');
        }
        catch (error) {
            throw new error_utils_1.CustomError("Product variants were created, but loading store locations failed. Please try again.", 500);
        }
        if (locations.length === 0) {
            throw new error_utils_1.CustomError("No inventory locations are configured for this store. Add a location and retry.", 404);
        }
        const inventoryLevelDocs = createdVariants.flatMap(variant => (locations.map(loc => ({
            variantId: variant._id,
            locationId: loc._id,
            onHand: 0,
            committed: 0,
            unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
            available: 0,
            incoming: 0,
        }))));
        try {
            await inventory_level_model_1.InventoryLevelModel.insertMany(inventoryLevelDocs);
        }
        catch (error) {
            throw new error_utils_1.CustomError("Product was created, but initializing inventory failed. Please try again.", 500);
        }
    }
    // 4) Return the created product (populated) so the client has useful display data
    let populatedProduct = null;
    try {
        populatedProduct = await product_model_1.Product.findById(product._id)
            .populate({ path: 'category' })
            .populate({ path: 'package', model: 'Packaging' })
            .populate({ path: 'tagIds', model: 'ProductTags' })
            .populate({ path: 'vendor', model: 'Vendor' })
            .populate({ path: 'productType', model: 'ProductType' });
    }
    catch (error) {
        throw new error_utils_1.CustomError("Product was created, but loading the final product details failed. Please refresh.", 500);
    }
    // 5) Send success response with created product payload
    res.status(201).json({
        success: true,
        data: populatedProduct || product,
        message: "Product created successfully",
    });
});
// PATCH /products/:id - partial update product
exports.updateProductById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid product id is required", 400);
    }
    const body = req.body;
    const updatePayload = {};
    const allowedFields = [
        "title",
        "description",
        "category",
        "price",
        "compareAtPrice",
        "chargeTax",
        "cost",
        "profit",
        "marginPercent",
        "unitPriceTotalAmount",
        "unitPriceTotalAmountMetric",
        "unitPriceBaseMeasure",
        "unitPriceBaseMeasureMetric",
        "inventoryTrackingEnabled",
        "continueSellingWhenOutOfStock",
        "sku",
        "barcode",
        "isPhysicalProduct",
        "package",
        "productWeight",
        "productWeightUnit",
        "countryOfOrigin",
        "harmonizedSystemCode",
        "variants",
        "pageTitle",
        "metaDescription",
        "urlHandle",
        "status",
        "onlineStorePublishing",
        "pointOfSalePublishing",
        "productType",
        "vendor",
        "tagIds",
        "imageUrls",
        "isDeleted",
    ];
    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            updatePayload[field] = body[field];
        }
    }
    // Backward compatibility with existing client payload naming
    if (Object.prototype.hasOwnProperty.call(body, "images")) {
        updatePayload.imageUrls = body.images ?? [];
    }
    // Keep weight units normalized
    if (updatePayload.productWeightUnit === "grams") {
        updatePayload.productWeightUnit = "g";
    }
    if (Object.keys(updatePayload).length === 0) {
        throw new error_utils_1.CustomError("No valid fields provided to update", 400);
    }
    const updatedProduct = await product_model_1.Product.findOneAndUpdate({ _id: id }, { $set: updatePayload }, { new: true, runValidators: true })
        .populate({ path: "category" })
        .populate({ path: "package", model: "Packaging" })
        .populate({ path: "tagIds", model: "ProductTags" })
        .populate({ path: "vendor", model: "Vendor" })
        .populate({ path: "productType", model: "ProductType" });
    if (!updatedProduct) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
    });
});
// Get products by store id
exports.getProductsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("storeId is required", 400);
    }
    const products = await product_model_1.Product.find({ storeId })
        .populate({ path: 'category' })
        .populate({ path: 'package', model: 'Packaging' })
        .populate({ path: 'tagIds', model: 'ProductTags' })
        .populate({ path: 'vendor', model: 'Vendor' })
        .populate({ path: 'productType', model: 'ProductType' })
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: products,
        count: products.length,
    });
});
// Get products by store id with pagination (public route)
exports.getProductsByStoreIdPublic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { page = "1", limit = "10", status = "published" } = req.query;
    if (!storeId) {
        throw new error_utils_1.CustomError("storeId is required", 400);
    }
    // Validate storeId format
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Invalid storeId format", 400);
    }
    // Parse and validate pagination parameters
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10)); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;
    // Get total count and products with pagination
    const [products, total] = await Promise.all([
        product_model_1.Product.find({ status: "active", storeId, isDeleted: { $ne: true } })
            .populate({ path: 'category', select: 'name' })
            .populate({ path: 'vendor', model: 'Vendor', select: 'name' })
            .select({
            title: 1,
            description: 1,
            price: 1,
            compareAtPrice: 1,
            imageUrls: 1,
            sku: 1,
            status: 1,
            category: 1,
            vendor: 1,
            createdAt: 1,
            updatedAt: 1
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        product_model_1.Product.countDocuments({ status: "active", storeId, isDeleted: { $ne: true } })
    ]);
    // ===== DISCOUNT LOGIC START =====
    const now = new Date();
    const nowDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTimeStr = now.toISOString().split('T')[1].substring(0, 5); // HH:mm
    // Helper function to filter discounts by valid date range
    const isDiscountActive = (d) => {
        // Check start date
        if (d.startDate && d.startDate > nowDateStr)
            return false;
        if (d.startDate === nowDateStr && d.startTime && d.startTime > nowTimeStr)
            return false;
        // Check end date
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
    // ===== AMOUNT OFF PRODUCTS DISCOUNTS =====
    const activeProductDiscounts = await models_1.AmountOffProductsDiscount.find({
        storeId,
        status: 'active',
        // Fetch both automatic and discount-code based discounts
    }).lean();
    const validProductDiscounts = activeProductDiscounts.filter(isDiscountActive);
    // Get discount entries for product discounts
    const productDiscountIds = validProductDiscounts.map((d) => d._id);
    const productDiscountEntries = productDiscountIds.length > 0
        ? await models_1.AmountOffProductsEntry.find({
            storeId,
            discountId: { $in: productDiscountIds }
        }).lean()
        : [];
    // Build maps for quick lookup
    const productDiscountById = new Map();
    for (const d of validProductDiscounts) {
        productDiscountById.set(String(d._id), d);
    }
    // Group entries by discount
    const entriesByDiscount = new Map();
    for (const entry of productDiscountEntries) {
        const key = String(entry.discountId);
        if (!entriesByDiscount.has(key))
            entriesByDiscount.set(key, []);
        entriesByDiscount.get(key).push(entry);
    }
    // Get collection-based product mappings
    const collectionIdsInEntries = productDiscountEntries
        .filter((e) => e.collectionId)
        .map((e) => e.collectionId);
    let collectionProductMap = new Map(); // collectionId -> productIds
    if (collectionIdsInEntries.length > 0) {
        const collectionEntries = await collection_entry_model_1.CollectionEntry.find({
            collectionId: { $in: collectionIdsInEntries }
        }).lean();
        for (const ce of collectionEntries) {
            const colKey = String(ce.collectionId);
            if (!collectionProductMap.has(colKey))
                collectionProductMap.set(colKey, []);
            collectionProductMap.get(colKey).push(String(ce.productId));
        }
    }
    // Build productId -> best product discount map
    const productDiscountMap = new Map();
    for (const discount of validProductDiscounts) {
        const discountId = String(discount._id);
        const entries = entriesByDiscount.get(discountId) || [];
        // Get all product IDs this discount applies to
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
        // Apply discount to each applicable product (keep best discount)
        for (const productId of applicableProductIds) {
            const existing = productDiscountMap.get(productId);
            const newDiscount = {
                valueType: discount.valueType,
                percentage: discount.percentage,
                fixedAmount: discount.fixedAmount,
                title: discount.title,
                method: discount.method,
                discountCode: discount.discountCode
            };
            if (!existing) {
                productDiscountMap.set(productId, newDiscount);
            }
            else {
                // Compare and keep the better discount
                const existingValue = existing.valueType === 'percentage' ? (existing.percentage || 0) : (existing.fixedAmount || 0);
                const newValue = newDiscount.valueType === 'percentage' ? (newDiscount.percentage || 0) : (newDiscount.fixedAmount || 0);
                if (existing.valueType === newDiscount.valueType) {
                    if (newValue > existingValue) {
                        productDiscountMap.set(productId, newDiscount);
                    }
                }
                else if (newDiscount.valueType === 'fixed-amount' && newValue > existingValue) {
                    productDiscountMap.set(productId, newDiscount);
                }
            }
        }
    }
    // ===== AMOUNT OFF ORDER DISCOUNTS =====
    const activeOrderDiscounts = await models_1.AmountOffOrderDiscount.find({
        storeId,
        status: 'active',
        method: 'automatic', // Only automatic discounts show on storefront
    }).lean();
    const validOrderDiscounts = activeOrderDiscounts.filter(isDiscountActive);
    // Find the best order discount to display (store-wide offer)
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
            minimumQuantity: d.minimumQuantity
        };
        if (!bestOrderDiscount) {
            bestOrderDiscount = newDiscount;
        }
        else {
            // Keep the higher value discount
            const existingValue = bestOrderDiscount.valueType === 'percentage'
                ? (bestOrderDiscount.percentage || 0)
                : (bestOrderDiscount.fixedAmount || 0);
            const newValue = newDiscount.valueType === 'percentage'
                ? (newDiscount.percentage || 0)
                : (newDiscount.fixedAmount || 0);
            if (newValue > existingValue) {
                bestOrderDiscount = newDiscount;
            }
        }
    }
    // ===== ENRICH PRODUCTS WITH DISCOUNT INFO =====
    const publicOrigin = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const enrichedProducts = products.map((product) => {
        const productId = String(product._id);
        const discount = productDiscountMap.get(productId);
        return {
            ...product,
            imageUrls: (0, public_origin_util_1.absolutizeImageUrlsArray)(publicOrigin, product.imageUrls),
            productDiscount: discount || null
        };
    });
    // ===== DISCOUNT LOGIC END =====
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;
    res.status(200).json({
        success: true,
        data: enrichedProducts,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext,
            hasPrev
        },
        // Store-wide order discount (applies to whole order, not specific products)
        orderDiscount: bestOrderDiscount
    });
});
// GET /products/:id - get single product details (protected)
exports.getProductById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid product ID is required", 400);
    }
    const product = await product_model_1.Product.findOne({ _id: id })
        .populate("category")
        .populate("package")
        .populate("tagIds")
        .populate("vendor")
        .populate("productType");
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    res.status(200).json({
        success: true,
        data: product,
    });
});
// Get product details by ID (public route)
exports.getProductByIdPublic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { productId } = req.params;
    if (!productId || !mongoose_1.default.isValidObjectId(productId)) {
        throw new error_utils_1.CustomError("Valid product ID is required", 400);
    }
    const product = await product_model_1.Product.findOne({ _id: productId, status: "active", isDeleted: { $ne: true } })
        .populate({ path: "category", select: "name" })
        .populate({ path: "vendor", model: "Vendor", select: "name" })
        .select({
        title: 1,
        description: 1,
        price: 1,
        compareAtPrice: 1,
        imageUrls: 1,
        sku: 1,
        status: 1,
        category: 1,
        vendor: 1,
        storeId: 1,
        variants: 1,
        createdAt: 1,
        updatedAt: 1,
    })
        .lean();
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    const variants = await product_variants_model_1.ProductVariant.find({ productId, depricated: false })
        .select({
        price: 1,
        compareAtPrice: 1,
        optionValues: 1,
        sku: 1,
        images: 1,
    })
        .lean();
    const publicOrigin = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const variantsOut = variants.map((v) => ({
        ...v,
        images: (0, public_origin_util_1.absolutizeImageUrlsArray)(publicOrigin, v.images),
    }));
    res.status(200).json({
        success: true,
        data: {
            ...product,
            imageUrls: (0, public_origin_util_1.absolutizeImageUrlsArray)(publicOrigin, product.imageUrls),
            variants: variantsOut,
        },
    });
});
// POST /products/:id/variants - add one or more variants to an existing product
exports.addVariantsToProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { variants } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Product id is required", 400);
    }
    if (!Array.isArray(variants) || variants.length === 0) {
        throw new error_utils_1.CustomError("At least one variant (options) payload is required", 400);
    }
    // Validate shape quickly
    const validOptions = variants.filter((o) => o && typeof o.optionName === 'string' && Array.isArray(o.values) && o.values.length > 0);
    if (validOptions.length === 0) {
        throw new error_utils_1.CustomError('Variants payload must include at least one option with non-empty values', 400);
    }
    const product = await product_model_1.Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    // Instead of deleting synthetic default variants, mark them as deprecated
    // so that we dont show them in the ui
    // but they are still in the database to avoid historial orders data loss
    let existingVariants = await product_variants_model_1.ProductVariant.find({ productId: product._id, depricated: false });
    // Check if we have a synthetic variant that needs to be deprecated later
    const hasSyntheticVariant = existingVariants.length == 1 && existingVariants[0].isSynthetic && existingVariants[0]?.depricated == false;
    const syntheticVariantId = hasSyntheticVariant ? existingVariants[0]._id : null;
    console.log('Synthetic variant check:', {
        existingVariantsCount: existingVariants.length,
        isSynthetic: existingVariants[0]?.isSynthetic,
        isDeprecated: existingVariants[0]?.depricated,
        hasSyntheticVariant,
        syntheticVariantId
    });
    // Build option axes from remaining non-deprecated variants
    const existingActive = await product_variants_model_1.ProductVariant.find({ productId: product._id, depricated: false }).lean();
    const existingAxes = new Map();
    const existingSignatures = new Set();
    const buildSignature = (ov) => {
        const keys = Object.keys(ov).sort();
        return keys.map(k => `${k}=${ov[k]}`).join('|');
    };
    for (const ev of existingActive) {
        const ov = ev.optionValues || {};
        for (const [k, v] of Object.entries(ov)) {
            if (!existingAxes.has(k))
                existingAxes.set(k, new Set());
            existingAxes.get(k).add(String(v));
        }
        existingSignatures.add(buildSignature(ov));
    }
    // Merge incoming options into axes
    const unionAxes = new Map();
    for (const [k, set] of existingAxes.entries())
        unionAxes.set(k, new Set(Array.from(set)));
    for (const o of validOptions) {
        if (!unionAxes.has(o.optionName))
            unionAxes.set(o.optionName, new Set());
        const s = unionAxes.get(o.optionName);
        for (const v of o.values)
            s.add(String(v));
    }
    // Prepare entries and cartesian
    const optionEntries = Array.from(unionAxes.entries()).map(([name, set]) => [name, Array.from(set)]);
    if (optionEntries.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0, message: 'No options available to generate variants' });
    }
    const cartesian = (arrays) => arrays.reduce((acc, curr) => {
        if (acc.length === 0)
            return curr.map(v => [v]);
        const next = [];
        for (const a of acc) {
            for (const b of curr)
                next.push([...a, b]);
        }
        return next;
    }, []);
    const valuesArrays = optionEntries.map(([, values]) => values);
    const combos = cartesian(valuesArrays);
    const allCombos = combos.map(combo => {
        const optionValues = {};
        combo.forEach((val, i) => {
            const name = optionEntries[i][0];
            optionValues[name] = val;
        });
        return { optionValues };
    });
    // Insert the full union cartesian set; we'll deprecate previous ones after insert
    const newCombos = allCombos;
    if (newCombos.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0, message: 'No new variants to add' });
    }
    // Generate sequential SKUs based on current active count
    const baseSku = (product.sku && product.sku.length > 0)
        ? product.sku
        : (product.title ? product.title.replace(/\s+/g, '-').toUpperCase() : 'SKU');
    const activeCount = await product_variants_model_1.ProductVariant.countDocuments({ productId: product._id, depricated: false });
    const variantDocs = newCombos.map((v, idx) => {
        const optionValues = new Map(Object.entries(v.optionValues));
        return {
            productId: product._id,
            optionValues,
            sku: `${baseSku}-${activeCount + idx + 1}`,
            barcode: product.barcode ?? null,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? null,
            cost: product.cost ?? null,
            profit: product.profit ?? null,
            marginPercent: product.marginPercent ?? null,
            weightValue: product.productWeight ?? 0,
            weightUnit: product.productWeightUnit || 'kg',
            package: product.package,
            countryOfOrigin: product.countryOfOrigin ?? null,
            hsCode: product.harmonizedSystemCode ?? null,
            images: Array.isArray(product.imageUrls) ? product.imageUrls : [],
            unitPriceTotalAmount: product.unitPriceTotalAmount ?? undefined,
            unitPriceTotalAmountMetric: product.unitPriceTotalAmountMetric ?? undefined,
            unitPriceBaseMeasure: product.unitPriceBaseMeasure ?? undefined,
            unitPriceBaseMeasureMetric: product.unitPriceBaseMeasureMetric ?? undefined,
            chargeTax: product.chargeTax,
            outOfStockContinueSelling: product.continueSellingWhenOutOfStock ?? false,
            isInventoryTrackingEnabled: true,
            isSynthetic: false,
            isPhysicalProduct: product.isPhysicalProduct ?? true,
        };
    });
    const createdVariants = await product_variants_model_1.ProductVariant.insertMany(variantDocs);
    // Always create inventory levels for all variants across all locations
    {
        const locations = await location_model_1.LocationModel.find({ storeId: product.storeId }).select('_id');
        if (locations.length === 0) {
            throw new error_utils_1.CustomError("No locations found for this store", 404);
        }
        const inventoryLevelDocs = createdVariants.flatMap(variant => (locations.map(loc => ({
            variantId: variant._id,
            locationId: loc._id,
            onHand: 0,
            committed: 0,
            unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
            available: 0,
            incoming: 0,
        }))));
        await inventory_level_model_1.InventoryLevelModel.insertMany(inventoryLevelDocs);
    }
    // Deprecate previous non-synthetic variants excluding the ones we just created
    const createdIds = createdVariants.map(v => v._id);
    await product_variants_model_1.ProductVariant.updateMany({ productId: product._id, isSynthetic: false, _id: { $nin: createdIds } }, { $set: { depricated: true } });
    // Deprecate synthetic variant if it exists (this happens after we've used it to build new variants)
    if (hasSyntheticVariant && syntheticVariantId) {
        console.log('Deprecating synthetic variant:', syntheticVariantId);
        const result = await product_variants_model_1.ProductVariant.updateOne({ _id: syntheticVariantId }, { $set: { depricated: true } });
        console.log('Synthetic variant deprecation result:', result);
    }
    else {
        console.log('No synthetic variant to deprecate:', { hasSyntheticVariant, syntheticVariantId });
    }
    // Update the Product model's variants field with the new dimensions
    const updatedVariants = Array.from(unionAxes.entries()).map(([optionName, values]) => ({
        optionName,
        values: Array.from(values)
    }));
    await product_model_1.Product.findByIdAndUpdate(product._id, {
        $set: { variants: updatedVariants }
    });
    return res.status(200).json({ success: true, data: createdVariants, count: createdVariants.length, message: 'Variants added successfully' });
});
// DELETE /products/:id/variants - remove variants from an existing product
exports.deleteVariantsFromProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    // ========================================
    // STEP 1: EXTRACT AND VALIDATE INPUT
    // ========================================
    const { id } = req.params;
    const { dimensionName } = req.body;
    // Validate product ID
    if (!id) {
        throw new error_utils_1.CustomError("Product id is required", 400);
    }
    // Validate dimension name (must be a non-empty string)
    if (!dimensionName || typeof dimensionName !== 'string' || dimensionName.trim().length === 0) {
        throw new error_utils_1.CustomError("dimensionName must be a non-empty string", 400);
    }
    // ========================================
    // STEP 2: FIND PRODUCT AND VALIDATE
    // ========================================
    const product = await product_model_1.Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    // ========================================
    // STEP 3: GET EXISTING ACTIVE VARIANTS
    // ========================================
    // Get all non-deprecated variants for this product
    // These variants contain the current structure of dimensions
    const existingActive = await product_variants_model_1.ProductVariant.find({ productId: product._id, depricated: false }).lean();
    // If no active variants exist, nothing to delete
    if (existingActive.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            count: 0,
            message: 'No active variants to remove'
        });
    }
    // ========================================
    // STEP 4: BUILD OPTION AXES FROM EXISTING VARIANTS
    // ========================================
    // Extract all unique dimensions and their values from existing variants
    // Example: If variants are {color: "red", size: "M"} and {color: "blue", size: "L"}
    // We build: {color: ["red", "blue"], size: ["M", "L"]}
    const currentAxes = new Map();
    for (const ev of existingActive) {
        const ov = ev.optionValues || {};
        for (const [k, v] of Object.entries(ov)) {
            if (!currentAxes.has(k))
                currentAxes.set(k, new Set());
            currentAxes.get(k).add(String(v));
        }
    }
    // ========================================
    // STEP 5: GET DIMENSION NAMES AND VALIDATE DIMENSION NAME
    // ========================================
    // Get dimension names in order (e.g., ["color", "size", "fabric"])
    const dimensionNames = Array.from(currentAxes.keys());
    // Validate that the dimension name exists in the product's current dimensions
    // Example: If product has dimensions [color, size, fabric], valid names are "color", "size", "fabric"
    if (!dimensionNames.includes(dimensionName)) {
        throw new error_utils_1.CustomError(`Dimension '${dimensionName}' not found. Product has dimensions: [${dimensionNames.join(', ')}]`, 400);
    }
    // ========================================
    // STEP 6: IDENTIFY DIMENSION TO REMOVE
    // ========================================
    // The dimension to remove is the one specified in the request
    // Example: dimensionName = "fabric" means we want to remove the fabric dimension
    const dimensionToRemove = dimensionName;
    // ========================================
    // STEP 7: UPDATE PRODUCT MODEL
    // ========================================
    // Remove the dimension from the product's variants array
    // Example: If product.variants = [{optionName: "color", values: [...]}, {optionName: "size", values: [...]}, {optionName: "fabric", values: [...]}]
    // And dimensionName = "fabric", we remove the fabric dimension
    if (product.variants && product.variants.length > 0) {
        const updatedVariants = product.variants.filter(variant => variant.optionName !== dimensionToRemove);
        // Update the product document in the database
        await product_model_1.Product.findByIdAndUpdate(product._id, {
            $set: { variants: updatedVariants }
        });
    }
    // ========================================
    // STEP 8: DEPRECATE EXISTING VARIANTS
    // ========================================
    // Mark ALL existing variants as deprecated (not deleted for data integrity)
    // This is because all existing variants contain the dimension we're removing
    // Example: If we remove "fabric", all variants like {color: "red", size: "M", fabric: "cotton"} 
    // become invalid and must be deprecated
    await product_variants_model_1.ProductVariant.updateMany({ productId: product._id, depricated: false }, { $set: { depricated: true } });
    // ========================================
    // STEP 9: BUILD NEW AXES (REMAINING DIMENSIONS)
    // ========================================
    // Create new axes by excluding the dimension we're removing
    // Example: If we remove "fabric", new axes = {color: [...], size: [...]}
    const newAxes = new Map();
    for (const [name, values] of currentAxes.entries()) {
        if (name !== dimensionToRemove) {
            newAxes.set(name, new Set(values));
        }
    }
    // ========================================
    // STEP 10: GENERATE NEW CARTESIAN PRODUCT
    // ========================================
    // Convert the new axes into a format suitable for Cartesian product generation
    // Example: {color: ["red", "blue"], size: ["M", "L"]} becomes [["red", "blue"], ["M", "L"]]
    const optionEntries = Array.from(newAxes.entries()).map(([name, set]) => [name, Array.from(set)]);
    // ========================================
    // STEP 11: HANDLE NO DIMENSIONS LEFT - OPTIMIZATION
    // ========================================
    // If all dimensions were removed, reactivate existing synthetic variant instead of creating new one
    if (optionEntries.length === 0) {
        // ========================================
        // OPTIMIZATION: REACTIVATE EXISTING SYNTHETIC VARIANT
        // ========================================
        // Instead of creating a new synthetic variant, find and reactivate the existing one
        // This is more efficient and maintains data consistency
        const existingSyntheticVariant = await product_variants_model_1.ProductVariant.findOne({
            productId: product._id,
            isSynthetic: true
        });
        if (existingSyntheticVariant) {
            // Reactivate the existing synthetic variant
            await product_variants_model_1.ProductVariant.findByIdAndUpdate(existingSyntheticVariant._id, {
                $set: {
                    depricated: false,
                    updatedAt: new Date()
                }
            });
            // Return success response for synthetic variant reactivation
            return res.status(200).json({
                success: true,
                data: [existingSyntheticVariant],
                count: 1,
                message: `All variants deprecated and existing synthetic variant reactivated (dimension '${dimensionToRemove}' removed)`
            });
        }
    }
    // ========================================
    // STEP 13: GENERATE NEW VARIANTS FROM REMAINING DIMENSIONS
    // ========================================
    // Create a Cartesian product function to generate all possible combinations
    // Example: color=["red", "blue"] and size=["M", "L"] generates:
    // [["red", "M"], ["red", "L"], ["blue", "M"], ["blue", "L"]]
    const cartesian = (arrays) => arrays.reduce((acc, curr) => {
        if (acc.length === 0)
            return curr.map(v => [v]);
        const next = [];
        for (const a of acc) {
            for (const b of curr)
                next.push([...a, b]);
        }
        return next;
    }, []);
    // Extract just the values arrays for Cartesian product generation
    // Example: [["red", "blue"], ["M", "L"]] from optionEntries
    const valuesArrays = optionEntries.map(([, values]) => values);
    const combos = cartesian(valuesArrays);
    // ========================================
    // STEP 14: CREATE VARIANT DOCUMENTS
    // ========================================
    // Generate SKU base and create variant documents for each combination
    const baseSku = product.sku || (product.title ? product.title.replace(/\s+/g, '-').toUpperCase() : 'SKU');
    const variantDocs = combos.map((combo, idx) => {
        // Create option values map for this combination
        // Example: combo = ["red", "M"] with optionEntries = [["color", [...]], ["size", [...]]]
        // Results in optionValues = {color: "red", size: "M"}
        const optionValues = new Map();
        combo.forEach((val, i) => {
            const name = optionEntries[i][0];
            optionValues.set(name, val);
        });
        // Create variant document with all product properties
        return {
            productId: product._id,
            optionValues,
            sku: `${baseSku}-${idx + 1}`, // Generate sequential SKUs
            barcode: product.barcode ?? null,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? null,
            cost: product.cost ?? null,
            profit: product.profit ?? null,
            marginPercent: product.marginPercent ?? null,
            weightValue: product.productWeight ?? 0,
            weightUnit: product.productWeightUnit || 'kg',
            package: product.package,
            countryOfOrigin: product.countryOfOrigin ?? null,
            hsCode: product.harmonizedSystemCode ?? null,
            images: Array.isArray(product.imageUrls) ? product.imageUrls : [],
            unitPriceTotalAmount: product.unitPriceTotalAmount ?? undefined,
            unitPriceTotalAmountMetric: product.unitPriceTotalAmountMetric ?? undefined,
            unitPriceBaseMeasure: product.unitPriceBaseMeasure ?? undefined,
            unitPriceBaseMeasureMetric: product.unitPriceBaseMeasureMetric ?? undefined,
            chargeTax: product.chargeTax,
            outOfStockContinueSelling: product.continueSellingWhenOutOfStock ?? false,
            isInventoryTrackingEnabled: true,
            isSynthetic: false, // These are real variants, not synthetic
            isPhysicalProduct: product.isPhysicalProduct ?? true,
            depricated: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
    // ========================================
    // STEP 15: INSERT NEW VARIANTS INTO DATABASE
    // ========================================
    // Bulk insert all new variant documents
    const createdVariants = await product_variants_model_1.ProductVariant.insertMany(variantDocs);
    // ========================================
    // STEP 16: CREATE INVENTORY LEVELS FOR NEW VARIANTS
    // ========================================
    // Create inventory tracking for all variants that have tracking enabled
    const tracked = createdVariants.filter(v => v.isInventoryTrackingEnabled);
    if (tracked.length > 0) {
        const store = await store_model_1.Store.findById(product.storeId).select('defaultLocation');
        if (store) {
            const locations = await location_model_1.LocationModel.find({ storeId: product.storeId }).select('_id');
            if (locations.length > 0) {
                const inventoryLevelDocs = tracked.flatMap(variant => (locations.map(loc => ({
                    variantId: variant._id,
                    locationId: loc._id,
                    onHand: 0,
                    committed: 0,
                    unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
                    available: 0,
                }))));
                await inventory_level_model_1.InventoryLevelModel.insertMany(inventoryLevelDocs);
            }
        }
    }
    // ========================================
    // STEP 17: RETURN SUCCESS RESPONSE
    // ========================================
    // Return the created variants with success message
    return res.status(200).json({
        success: true,
        data: createdVariants,
        count: createdVariants.length,
        message: `All variants deprecated and ${createdVariants.length} new variants created (dimension '${dimensionToRemove}' removed)`
    });
});
// POST /products/:id/options - add a new option to an existing product
exports.addOptionToProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    // ========================================
    // STEP 1: EXTRACT AND VALIDATE INPUT
    // ========================================
    // Example request body:
    // {
    //   "values": ["Red", "Green"]
    // }
    // optionName comes from URL parameter: /products/:id/variants/:dimensionName/options
    const { id, dimensionName } = req.params;
    const { values } = req.body;
    const optionName = dimensionName;
    // Validate product ID
    if (!id) {
        throw new error_utils_1.CustomError("Product id is required", 400);
    }
    // Validate option name (must be a non-empty string)
    if (!optionName || typeof optionName !== 'string' || optionName.trim().length === 0) {
        throw new error_utils_1.CustomError("dimensionName parameter must be a non-empty string", 400);
    }
    // Validate values array (must be non-empty array of strings)
    if (!Array.isArray(values) || values.length === 0) {
        throw new error_utils_1.CustomError("values must be a non-empty array of strings", 400);
    }
    // Validate that all values are non-empty strings
    const validValues = values.filter(v => typeof v === 'string' && v.trim().length > 0);
    if (validValues.length === 0) {
        throw new error_utils_1.CustomError("values must contain at least one non-empty string", 400);
    }
    // ========================================
    // STEP 2: FIND PRODUCT AND VALIDATE
    // ========================================
    // Find the product by ID to ensure it exists
    const product = await product_model_1.Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    // ========================================
    // STEP 3: GET EXISTING ACTIVE VARIANTS
    // ========================================
    // Get all non-deprecated variants for this product
    // These are the current "active" variants that customers can purchase
    const existingActive = await product_variants_model_1.ProductVariant.find({ productId: product._id, depricated: false }).lean();
    // Example existingActive data structure:
    // [
    //   { _id: "var1", optionValues: { "Size": "Large", "Color": "Black" }, sku: "SHIRT-1", ... },
    //   { _id: "var2", optionValues: { "Size": "Large", "Color": "Blue" }, sku: "SHIRT-2", ... },
    //   { _id: "var3", optionValues: { "Size": "Medium", "Color": "Black" }, sku: "SHIRT-3", ... },
    //   { _id: "var4", optionValues: { "Size": "Medium", "Color": "Blue" }, sku: "SHIRT-4", ... }
    // ]
    // If no active variants exist, this shouldn't happen in normal UX flow
    // as users wouldn't see "Add Option" button without existing variants
    if (existingActive.length === 0) {
        throw new error_utils_1.CustomError("No active variants found. Cannot add option to product without existing variants.", 400);
    }
    // ========================================
    // STEP 4: BUILD EXISTING OPTION AXES
    // ========================================
    // Extract all unique dimensions and their values from existing variants
    // This creates a map of option names to their possible values
    const currentAxes = new Map();
    for (const ev of existingActive) {
        const ov = ev.optionValues || {};
        for (const [k, v] of Object.entries(ov)) {
            if (!currentAxes.has(k))
                currentAxes.set(k, new Set());
            currentAxes.get(k).add(String(v));
        }
    }
    // Example currentAxes data structure after processing:
    // Map {
    //   "Size" => Set { "Large", "Medium" },
    //   "Color" => Set { "Black", "Blue" }
    // }
    // ========================================
    // STEP 5: CHECK IF OPTION EXISTS
    // ========================================
    // Check if the option name exists (we're adding values to an existing option)
    // Example: If request is to add "Red" to "Color" option, we verify "Color" exists
    if (!currentAxes.has(optionName)) {
        throw new error_utils_1.CustomError(`Option '${optionName}' does not exist. Cannot add values to non-existent option.`, 400);
    }
    // ========================================
    // STEP 6: CREATE UNION AXES WITH NEW VALUES
    // ========================================
    // We're adding new values to an existing option
    // Example: If Color = ["Black", "Blue"] and we add ["Red"], result is Color = ["Black", "Blue", "Red"]
    // Get existing values for this option
    const existingValues = Array.from(currentAxes.get(optionName));
    // Example: existingValues = ["Black", "Blue"]
    // Check for duplicate values to prevent adding values that already exist
    const duplicateValues = validValues.filter(value => existingValues.includes(value));
    if (duplicateValues.length > 0) {
        throw new error_utils_1.CustomError(`Values already exist for option '${optionName}': ${duplicateValues.join(', ')}`, 400);
    }
    // Create union axes with new values added
    const unionAxes = new Map();
    for (const [name, values] of currentAxes.entries()) {
        unionAxes.set(name, new Set(values));
    }
    // Add new values to the existing option
    const allValues = [...existingValues, ...validValues];
    unionAxes.set(optionName, new Set(allValues));
    // Example unionAxes data structure after adding "Red" to Color:
    // Map {
    //   "Size" => Set { "Large", "Medium" },
    //   "Color" => Set { "Black", "Blue", "Red" }  // ← "Red" added here
    // }
    // ========================================
    // STEP 7: GENERATE ONLY NEW COMBINATIONS
    // ========================================
    // Generate only the NEW combinations that include the new option values
    // We don't need to recreate existing combinations, just the new ones
    // Get all existing combinations (from current active variants)
    const existingCombinations = [];
    for (const ev of existingActive) {
        const ov = ev.optionValues || {};
        existingCombinations.push(ov);
    }
    // Example existingCombinations data structure:
    // [
    //   { "Size": "Large", "Color": "Black" },
    //   { "Size": "Large", "Color": "Blue" },
    //   { "Size": "Medium", "Color": "Black" },
    //   { "Size": "Medium", "Color": "Blue" }
    // ]
    // Generate new combinations: each existing combination × each new option value
    const newCombinations = [];
    for (const existingCombo of existingCombinations) {
        for (const newValue of validValues) {
            const newCombo = { ...existingCombo, [optionName]: newValue };
            newCombinations.push(newCombo);
        }
    }
    // Example newCombinations data structure (with duplicates):
    // [
    //   { "Size": "Large", "Color": "Red" },    // from Large+Black + Red
    //   { "Size": "Large", "Color": "Red" },    // from Large+Blue + Red (duplicate!)
    //   { "Size": "Medium", "Color": "Red" },  // from Medium+Black + Red
    //   { "Size": "Medium", "Color": "Red" }    // from Medium+Blue + Red (duplicate!)
    // ]
    // Remove duplicates from new combinations
    const uniqueNewCombinations = newCombinations.filter((combo, index, self) => index === self.findIndex(c => Object.keys(combo).every(key => combo[key] === c[key])));
    // Example uniqueNewCombinations data structure (after deduplication):
    // [
    //   { "Size": "Large", "Color": "Red" },
    //   { "Size": "Medium", "Color": "Red" }
    // ]
    // ========================================
    // STEP 8: CREATE VARIANT DOCUMENTS
    // ========================================
    // Create variant documents for only the new combinations
    // Each new combination becomes a new product variant with its own SKU
    const baseSku = product.sku || (product.title ? product.title.replace(/\s+/g, '-').toUpperCase() : 'SKU');
    const variantDocs = uniqueNewCombinations.map((combo, idx) => {
        // Create option values map for this combination
        const optionValues = new Map();
        for (const [key, value] of Object.entries(combo)) {
            optionValues.set(key, value);
        }
        // Create variant document with all product properties
        return {
            productId: product._id,
            optionValues, // Map { "Size" => "Large", "Color" => "Red" }
            sku: `${baseSku}-${idx + 1}`, // Generate sequential SKUs: SHIRT-1, SHIRT-2, etc.
            barcode: product.barcode ?? null,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? null,
            cost: product.cost ?? null,
            profit: product.profit ?? null,
            marginPercent: product.marginPercent ?? null,
            weightValue: product.productWeight ?? 0,
            weightUnit: product.productWeightUnit || 'kg',
            package: product.package,
            countryOfOrigin: product.countryOfOrigin ?? null,
            hsCode: product.harmonizedSystemCode ?? null,
            images: Array.isArray(product.imageUrls) ? product.imageUrls : [],
            unitPriceTotalAmount: product.unitPriceTotalAmount ?? undefined,
            unitPriceTotalAmountMetric: product.unitPriceTotalAmountMetric ?? undefined,
            unitPriceBaseMeasure: product.unitPriceBaseMeasure ?? undefined,
            unitPriceBaseMeasureMetric: product.unitPriceBaseMeasureMetric ?? undefined,
            chargeTax: product.chargeTax,
            outOfStockContinueSelling: product.continueSellingWhenOutOfStock ?? false,
            isInventoryTrackingEnabled: true,
            isSynthetic: false,
            isPhysicalProduct: product.isPhysicalProduct ?? true,
            depricated: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
    // Example variantDocs data structure:
    // [
    //   {
    //     productId: "product123",
    //     optionValues: Map { "Size" => "Large", "Color" => "Red" },
    //     sku: "SHIRT-1",
    //     price: 29.99,
    //     ... (all other product properties)
    //   },
    //   {
    //     productId: "product123", 
    //     optionValues: Map { "Size" => "Medium", "Color" => "Red" },
    //     sku: "SHIRT-2",
    //     price: 29.99,
    //     ... (all other product properties)
    //   }
    // ]
    // ========================================
    // STEP 9: INSERT NEW VARIANTS INTO DATABASE
    // ========================================
    // Bulk insert all new variant documents into the database
    const createdVariants = await product_variants_model_1.ProductVariant.insertMany(variantDocs);
    // Example: 2 new variants inserted with IDs "var5", "var6"
    // ========================================
    // STEP 10: CREATE INVENTORY LEVELS FOR NEW VARIANTS
    // ========================================
    // Create inventory tracking for all variants that have tracking enabled
    // This ensures each new variant can be tracked across all store locations
    const tracked = createdVariants.filter(v => v.isInventoryTrackingEnabled);
    if (tracked.length > 0) {
        const locations = await location_model_1.LocationModel.find({ storeId: product.storeId }).select('_id');
        if (locations.length > 0) {
            // Create inventory level documents for each variant × each location
            const inventoryLevelDocs = tracked.flatMap(variant => (locations.map(loc => ({
                variantId: variant._id, // "var5" or "var6"
                locationId: loc._id, // "loc1", "loc2", etc.
                onHand: 0, // Initial stock: 0
                committed: 0, // Reserved stock: 0
                unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
                available: 0, // Available stock: 0
                incoming: 0, // Incoming stock: 0
            }))));
            await inventory_level_model_1.InventoryLevelModel.insertMany(inventoryLevelDocs);
            // Example inventoryLevelDocs data structure:
            // [
            //   { variantId: "var5", locationId: "loc1", onHand: 0, ... },
            //   { variantId: "var5", locationId: "loc2", onHand: 0, ... },
            //   { variantId: "var6", locationId: "loc1", onHand: 0, ... },
            //   { variantId: "var6", locationId: "loc2", onHand: 0, ... }
            // ]
        }
    }
    // ========================================
    // STEP 11: UPDATE PRODUCT MODEL
    // ========================================
    // Update the Product model's variants field with the merged values
    // This updates the product's option structure to reflect the new values
    const updatedVariants = Array.from(unionAxes.entries()).map(([optName, values]) => ({
        optionName: optName,
        values: Array.from(values)
    }));
    await product_model_1.Product.findByIdAndUpdate(product._id, {
        $set: { variants: updatedVariants }
    });
    // Example updatedVariants data structure:
    // [
    //   { optionName: "Size", values: ["Large", "Medium"] },
    //   { optionName: "Color", values: ["Black", "Blue", "Red"] }  // ← "Red" added here
    // ]
    // ========================================
    // STEP 12: RETURN SUCCESS RESPONSE
    // ========================================
    // Return the created variants with success message
    return res.status(200).json({
        success: true,
        data: createdVariants,
        count: createdVariants.length,
        message: `Option '${optionName}' added successfully. ${createdVariants.length} new variants created.`
    });
    // Example response:
    // {
    //   "success": true,
    //   "data": [
    //     { _id: "var5", optionValues: { "Size": "Large", "Color": "Red" }, sku: "SHIRT-1", ... },
    //     { _id: "var6", optionValues: { "Size": "Medium", "Color": "Red" }, sku: "SHIRT-2", ... }
    //   ],
    //   "count": 2,
    //   "message": "Option 'Color' added successfully. 2 new variants created."
    // }
});
// GET /products/search
// Query: storeId (required), q (required), originLocationId?, destinationLocationId?, page?, limit?
// Search products within a store and enrich each variant with availability at
// an origin and destination location. Designed for transfer workflows.
//
// Request (query params):
// - storeId (required): scope products to a store
// - q (required): free-text query (matches title/sku; can be extended later)
// - originLocationId (optional): compute availability.origin per variant
// - destinationLocationId (optional): compute availability.destination per variant
// - page, limit (optional): pagination controls (defaults page=1, limit=20)
//
// Response:
//   {
//     success: true,
//     data: [
//       {
//         product: { _id, title, sku, imageUrls, vendor, productType },
//         variants: [
//           {
//             _id, sku, optionValues, price, images,
//             availability: { origin: number, destination: number }
//           }
//         ]
//       }
//     ],
//     pagination: { page, limit, total, hasNext }
//   }
exports.searchProductsWithAvailability = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    // 1) Parse and validate input
    const { storeId, q, originLocationId, destinationLocationId, page = "1", limit = "20", } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!q || q.trim().length === 0) {
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    }
    // Normalize pagination and build case-insensitive regex for search
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const rx = new RegExp(q.trim(), "i");
    // 2) Fetch products matching store + query (title/sku). Keep this simple and fast.
    const [products, total] = await Promise.all([
        product_model_1.Product.find({
            storeId,
            isDeleted: { $ne: true },
            $or: [
                { title: rx },
                { sku: rx },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select({
            title: 1,
            sku: 1,
            imageUrls: 1,
            vendor: 1,
            productType: 1,
        })
            .lean(),
        product_model_1.Product.countDocuments({
            storeId,
            isDeleted: { $ne: true },
            $or: [
                { title: rx },
                { sku: rx },
            ],
        }),
    ]);
    if (products.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: { page: pageNum, limit: limitNum, total: 0, hasNext: false },
        });
    }
    // 3) Fetch all variants for the page of products (one round trip)
    const productIds = products.map(p => p._id);
    // Only consider active variants (not deprecated)
    const variants = await product_variants_model_1.ProductVariant.find({ productId: { $in: productIds }, depricated: false })
        .select({ productId: 1, sku: 1, optionValues: 1, price: 1, images: 1 })
        .lean();
    // Map productId -> variants array for quick assembly later
    const productIdToVariants = new Map();
    for (const v of variants) {
        const key = String(v.productId);
        if (!productIdToVariants.has(key))
            productIdToVariants.set(key, []);
        productIdToVariants.get(key).push(v);
    }
    // 4) Fetch inventory levels only for origin/destination for these variant ids
    //    - We only query for the current page's variantIds and only the two relevant locations
    const variantIds = variants.map(v => v._id);
    const locationIds = [];
    if (originLocationId && mongoose_1.default.isValidObjectId(originLocationId))
        locationIds.push(String(originLocationId));
    if (destinationLocationId && mongoose_1.default.isValidObjectId(destinationLocationId))
        locationIds.push(String(destinationLocationId));
    let levels = [];
    if (variantIds.length > 0 && locationIds.length > 0) {
        levels = await inventory_level_model_1.InventoryLevelModel.find({
            variantId: { $in: variantIds },
            locationId: { $in: locationIds },
        })
            .select({ variantId: 1, locationId: 1, available: 1, onHand: 1, committed: 1, unavailable: 1 })
            .lean();
    }
    // Build availability map for O(1) lookups during response shaping
    //    - Pre-seed each variant with {origin:0, destination:0}
    //    - Then write the computed available value into the correct bucket
    const originIdStr = originLocationId && mongoose_1.default.isValidObjectId(originLocationId) ? String(originLocationId) : null;
    const destIdStr = destinationLocationId && mongoose_1.default.isValidObjectId(destinationLocationId) ? String(destinationLocationId) : null;
    const availabilityByVariant = new Map();
    for (const vId of variantIds) {
        availabilityByVariant.set(String(vId), { origin: 0, destination: 0 });
    }
    for (const lvl of levels) {
        const key = String(lvl.variantId);
        const entry = availabilityByVariant.get(key);
        if (!entry)
            continue;
        // Prefer persisted 'available' if present; otherwise compute it
        const computedAvailable = typeof lvl.available === 'number'
            ? lvl.available
            : Math.max(0, (lvl.onHand || 0) - (lvl.committed || 0) - ((lvl.unavailable?.damaged || 0) + (lvl.unavailable?.qualityControl || 0) + (lvl.unavailable?.safetyStock || 0) + (lvl.unavailable?.other || 0)));
        if (originIdStr && String(lvl.locationId) === originIdStr) {
            entry.origin = computedAvailable;
        }
        else if (destIdStr && String(lvl.locationId) === destIdStr) {
            entry.destination = computedAvailable;
        }
    }
    // 5) Assemble response: products with nested variants and per-location availability
    const data = products.map(p => {
        const pv = productIdToVariants.get(String(p._id)) || [];
        const shapedVariants = pv.map(v => ({
            _id: v._id,
            sku: v.sku,
            optionValues: v.optionValues,
            price: v.price,
            images: v.images,
            availability: availabilityByVariant.get(String(v._id)) || { origin: 0, destination: 0 },
        }));
        return { product: p, variants: shapedVariants };
    });
    // 6) Return with simple pagination metadata
    return res.status(200).json({
        success: true,
        data,
        pagination: { page: pageNum, limit: limitNum, total, hasNext: skip + products.length < total },
    });
});
// GET /products/search-basic?q=...&storeId=...
// Returns: [{ _id, title, imageUrl }]
exports.searchProductsBasic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { q = '', storeId } = req.query;
    if (!q || q.trim().length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }
    const rx = new RegExp(q.trim(), 'i');
    const filter = { $or: [{ title: rx }], isDeleted: { $ne: true } };
    if (storeId && mongoose_1.default.isValidObjectId(storeId))
        filter.storeId = storeId;
    const products = await product_model_1.Product.find(filter)
        .select({ title: 1, imageUrls: 1 })
        .limit(20)
        .lean();
    const data = products.map(p => ({
        _id: p._id,
        title: p.title,
        imageUrl: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls[0] : null,
    }));
    return res.status(200).json({ success: true, data });
});
// GET /products/search-with-variants?storeId=...&q=...&page?&limit?
exports.searchProductsWithVariants = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, q = '', page = '1', limit = '20', } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const filter = { storeId, isDeleted: { $ne: true } };
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), 'i');
        filter.$or = [{ title: rx }, { sku: rx }];
    }
    const [products, total] = await Promise.all([
        product_model_1.Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select({
            title: 1,
            sku: 1,
            imageUrls: 1,
            vendor: 1,
            productType: 1,
            status: 1,
        })
            .lean(),
        product_model_1.Product.countDocuments(filter),
    ]);
    if (products.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: { page: pageNum, limit: limitNum, total: 0, hasNext: false },
        });
    }
    const productIds = products.map((p) => p._id);
    const variants = await product_variants_model_1.ProductVariant.find({ productId: { $in: productIds }, depricated: false })
        .select({
        productId: 1,
        sku: 1,
        optionValues: 1,
        price: 1,
        compareAtPrice: 1,
        images: 1,
    })
        .lean();
    const optionValuesToPlainObject = (optionValues) => {
        if (!optionValues)
            return {};
        if (optionValues instanceof Map) {
            return Object.fromEntries(optionValues);
        }
        if (typeof optionValues === 'object') {
            const entries = Object.entries(optionValues).map(([key, value]) => [key, String(value)]);
            return Object.fromEntries(entries);
        }
        return {};
    };
    const productIdToVariants = new Map();
    for (const variant of variants) {
        const key = String(variant.productId);
        if (!productIdToVariants.has(key))
            productIdToVariants.set(key, []);
        productIdToVariants.get(key).push({
            _id: variant._id,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            images: variant.images,
            optionValues: optionValuesToPlainObject(variant.optionValues),
        });
    }
    const data = products.map((product) => ({
        product: {
            _id: product._id,
            title: product.title,
            sku: product.sku,
            imageUrl: Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? product.imageUrls[0] : null,
            vendor: product.vendor,
            productType: product.productType,
            status: product.status,
        },
        variants: productIdToVariants.get(String(product._id)) || [],
    }));
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            hasNext: skip + products.length < total,
        },
    });
});
// GET /products/search-product-with-variant-and-destination
// Query: storeId (required), q (required), destinationLocationId (required), page?, limit?
// Returns products matching q with their active variants and availability at the destination location only
exports.searchProductsWithVariantAndDestination = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, q, destinationLocationId, page = "1", limit = "20", } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!q || q.trim().length === 0) {
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    }
    if (!destinationLocationId || !mongoose_1.default.isValidObjectId(destinationLocationId)) {
        throw new error_utils_1.CustomError("Valid destinationLocationId is required", 400);
    }
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const rx = new RegExp(q.trim(), 'i');
    const [products, total] = await Promise.all([
        product_model_1.Product.find({
            storeId,
            isDeleted: { $ne: true },
            $or: [{ title: rx }, { sku: rx }],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select({ title: 1, sku: 1, imageUrls: 1 })
            .lean(),
        product_model_1.Product.countDocuments({ storeId, isDeleted: { $ne: true }, $or: [{ title: rx }, { sku: rx }] }),
    ]);
    if (products.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: { page: pageNum, limit: limitNum, total: 0, hasNext: false },
        });
    }
    const productIds = products.map(p => p._id);
    const variants = await product_variants_model_1.ProductVariant.find({ productId: { $in: productIds }, depricated: false })
        .select({ productId: 1, sku: 1, optionValues: 1, price: 1, images: 1 })
        .lean();
    const variantIds = variants.map(v => v._id);
    let levels = [];
    if (variantIds.length > 0) {
        levels = await inventory_level_model_1.InventoryLevelModel.find({
            variantId: { $in: variantIds },
            locationId: destinationLocationId,
        })
            .select({ variantId: 1, available: 1, onHand: 1, committed: 1, unavailable: 1 })
            .lean();
    }
    const availabilityByVariant = new Map();
    for (const vId of variantIds)
        availabilityByVariant.set(String(vId), 0);
    for (const lvl of levels) {
        const computed = typeof lvl.available === 'number'
            ? lvl.available
            : Math.max(0, (lvl.onHand || 0) - (lvl.committed || 0) - ((lvl.unavailable?.damaged || 0) + (lvl.unavailable?.qualityControl || 0) + (lvl.unavailable?.safetyStock || 0) + (lvl.unavailable?.other || 0)));
        availabilityByVariant.set(String(lvl.variantId), computed);
    }
    const productIdToVariants = new Map();
    for (const v of variants) {
        const key = String(v.productId);
        if (!productIdToVariants.has(key))
            productIdToVariants.set(key, []);
        productIdToVariants.get(key).push(v);
    }
    const data = products.map(p => {
        const pv = productIdToVariants.get(String(p._id)) || [];
        const shaped = pv.map(v => ({
            _id: v._id,
            sku: v.sku,
            optionValues: v.optionValues,
            price: v.price,
            images: v.images,
            availability: availabilityByVariant.get(String(v._id)) || 0,
        }));
        return { product: p, variants: shaped };
    });
    return res.status(200).json({
        success: true,
        data,
        pagination: { page: pageNum, limit: limitNum, total, hasNext: skip + products.length < total },
    });
});
// Soft delete product
exports.softDeleteProductById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid product id is required", 400);
    }
    const product = await product_model_1.Product.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, { $set: { isDeleted: true } }, { new: true });
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    res.status(200).json({
        success: true,
        data: { _id: product._id, isDeleted: true },
        message: "Product deleted successfully",
    });
});
