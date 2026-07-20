import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CatalogProduct } from '../models/catalog-product/catalog-product.model';
import { CatalogProductVariant } from '../models/catalog-product-variant/catalog-product-variant.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { Product } from '../models/product/product.model';
import { ProductVariant } from '../models/product/product-variants.model';

// POST /catalog-products
export const createCatalogProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { catalogId, productId, isManuallyAdded } = req.body as {
    catalogId: string;
    productId: string;
    isManuallyAdded?: boolean;
  };

  if (!catalogId || !mongoose.isValidObjectId(catalogId)) throw new CustomError('Valid catalogId is required', 400);
  if (!productId || !mongoose.isValidObjectId(productId)) throw new CustomError('Valid productId is required', 400);

  // Ensure product exists before proceeding
  const baseProduct = await Product.findById(productId).select({ _id: 1, title: 1, imageUrls: 1, compareAtPrice: 1, price: 1}).lean();
  if (!baseProduct) throw new CustomError('Product not found', 404);

  const created = await CatalogProduct.create({ catalogId, productId, isManuallyAdded: isManuallyAdded ?? true, price: baseProduct.price, compareAtPrice: baseProduct.compareAtPrice });

  // Create CatalogProductVariant entries for all variants of this product in this catalog
  const productVariants = await ProductVariant.find({ productId })
    .select({ _id: 1, productId: 1, price: 1, compareAtPrice: 1})
    .lean();

  if (productVariants.length > 0) {
    const variantDocs = productVariants.map((v: any) => ({
      catalogId,
      productId,
      variantId: v._id,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
    }));
    // Best-effort insert; uniqueness on (catalogId, variantId) prevents duplicates
    await CatalogProductVariant.insertMany(variantDocs, { ordered: false });
  }

  // Build response from CatalogProduct + CatalogProductVariant (enrich with base product + variant display fields)
  const cp = await CatalogProduct.findById(created._id).lean();
  const cpvs = await CatalogProductVariant.find({ catalogId, productId }).lean();
  const variantIds = cpvs.map((v: any) => v.variantId);
  const pvDocs = variantIds.length
    ? await ProductVariant.find({ _id: { $in: variantIds } })
        .select({ _id: 1, sku: 1, images: 1, optionValues: 1 })
        .lean()
    : [];
  const pvMap: Record<string, any> = {};
  for (const v of pvDocs) pvMap[String(v._id)] = v;

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
          title: (baseProduct as any).title || '',
          imageUrl:
            (baseProduct as any).imageUrls && (baseProduct as any).imageUrls.length
              ? (baseProduct as any).imageUrls[0]
              : null,
          price: (cp as any)?.price ?? null,
          compareAtPrice: (cp as any)?.compareAtPrice ?? null,
        }
      : null,
    variants: cpvs.map((cv: any) => {
      const pv = pvMap[String(cv.variantId)] || {};
      return {
        _id: cv.variantId,
        sku: pv.sku || '',
        imageUrl: pv.images && pv.images.length ? pv.images[0] : null,
        optionValues: pv.optionValues || {},
        price: (cv as any)?.price ?? null,
        compareAtPrice: (cv as any)?.compareAtPrice ?? null,
      };
    }),
  };

  return res.status(201).json({ success: true, data: enriched, message: 'Catalog product created' });
});

// DELETE /catalog-products/:id
export const deleteCatalogProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);
  const deleted = await CatalogProduct.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Catalog product not found', 404);
  // Cascade delete catalog product variants for this catalog/product
  await CatalogProductVariant.deleteMany({ catalogId: deleted.catalogId, productId: deleted.productId });
  return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Catalog product deleted' });
});

// GET /catalog-products/catalog/:catalogId
export const getCatalogProductsByCatalogId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { catalogId } = req.params as { catalogId: string };
  if (!catalogId || !mongoose.isValidObjectId(catalogId)) throw new CustomError('Valid catalogId is required', 400);

  // 1) Fetch catalog products
  const catalogProducts = await CatalogProduct.find({ catalogId }).sort({ createdAt: -1 }).lean();
  if (catalogProducts.length === 0) {
    return res.status(200).json({ success: true, data: [], message: 'Catalog products fetched' });
  }

  // 2) Fetch catalog product variants for these products within this catalog
  const productIds = [...new Set(catalogProducts.map((cp) => String(cp.productId)))] as string[];
  const catalogProductVariants = await CatalogProductVariant.find({ catalogId, productId: { $in: productIds } }).lean();

  // 3) Populate base product docs for display fields
  const products = await Product.find({ _id: { $in: productIds } })
    .select({ _id: 1, title: 1, imageUrls: 1 })
    .lean();
  const productIdToProduct: Record<string, any> = {};
  for (const p of products) productIdToProduct[String(p._id)] = p;

  // 4) Populate base variant docs for display fields
  const variantIds = [...new Set(catalogProductVariants.map((v) => String(v.variantId)))] as string[];
  const variantDocs = variantIds.length
    ? await ProductVariant.find({ _id: { $in: variantIds } })
        .select({ _id: 1, sku: 1, images: 1, optionValues: 1 })
        .lean()
    : [];
  const variantIdToVariant: Record<string, any> = {};
  for (const v of variantDocs) variantIdToVariant[String(v._id)] = v;

  // 5) Group CPVs by productId to compose response easily
  const productIdToCpvs: Record<string, any[]> = {};
  for (const cv of catalogProductVariants) {
    const key = String(cv.productId);
    if (!productIdToCpvs[key]) productIdToCpvs[key] = [];
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
            title: (p as any).title || '',
            imageUrl: (p as any).imageUrls && (p as any).imageUrls.length ? (p as any).imageUrls[0] : null,
            price: (cp as any)?.price ?? null,
            compareAtPrice: (cp as any)?.compareAtPrice ?? null,
          }
        : null,
      variants: pv.map((v: any) => ({
        ...v,
        // include cpv price fields by matching variantId
        price: (() => {
          const match = catalogProductVariants.find((cv) => String(cv.variantId) === String(v._id) && String(cv.productId) === String(cp.productId));
          return (match as any)?.price ?? null;
        })(),
        compareAtPrice: (() => {
          const match = catalogProductVariants.find((cv) => String(cv.variantId) === String(v._id) && String(cv.productId) === String(cp.productId));
          return (match as any)?.compareAtPrice ?? null;
        })(),
      })),
    };
  });

  return res.status(200).json({ success: true, data, message: 'Catalog products fetched' });
});

// PUT /catalog-products/variant/:id
export const updateCatalogProductVariant = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const { price, compareAtPrice } = req.body as { price?: number; compareAtPrice?: number };
  const update: Record<string, unknown> = {};
  if (typeof price === 'number') update.price = price;
  if (typeof compareAtPrice === 'number') update.compareAtPrice = compareAtPrice;
  if (Object.keys(update).length === 0) throw new CustomError('Nothing to update', 400);

  const updated = await CatalogProductVariant.findByIdAndUpdate(id, update, { new: true });
  if (!updated) throw new CustomError('Catalog product variant not found', 404);

  return res.status(200).json({
    success: true,
    data: {
      price: (updated as any)?.price ?? null,
      compareAtPrice: (updated as any)?.compareAtPrice ?? null,
    },
    message: 'Catalog product variant updated',
  });
});


