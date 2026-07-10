import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Collections } from "../models/collections/collections.model";
import { CollectionEntry } from "../models/collection-entry/collection-entry.model";
import { Product } from "../models/product/product.model";
import { AmountOffProductsDiscount, AmountOffProductsEntry, AmountOffOrderDiscount } from "../models";
import { absolutizeImageUrlsArray, publicOriginFromRequest } from "../utils/public-origin.util";

function normalizeUrlHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

function assertValidStoreId(storeId: string): void {
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
}

// Get collections by store id
export const getCollectionsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!storeId) throw new CustomError("storeId is required", 400);

  const collections = await Collections.find({ storeId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: collections, count: collections.length });
});

/** Storefront: resolve a published collection by store + url handle. */
export const getCollectionDetailsByUrlHandle = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, urlHandle } = req.params;
  assertValidStoreId(storeId);
  if (!urlHandle?.trim()) throw new CustomError("urlHandle is required", 400);

  const collection = await Collections.findOne({
    storeId,
    urlHandle: normalizeUrlHandle(urlHandle),
    status: "published",
  }).lean();

  if (!collection) {
    throw new CustomError("Collection not found", 404);
  }

  const productCount = await CollectionEntry.countDocuments({ collectionId: collection._id });

  res.status(200).json({
    success: true,
    data: { ...collection, productCount },
  });
});

async function sendStorefrontCollectionProductsResponse(
  req: Request,
  res: Response,
  collectionId: mongoose.Types.ObjectId,
  storeId: mongoose.Types.ObjectId
): Promise<void> {
  const { page = 1, limit = 12, q } = req.query as Record<string, any>;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const productIds: mongoose.Types.ObjectId[] = await CollectionEntry.find({ collectionId })
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

  const filter: any = { _id: { $in: productIds }, isDeleted: { $ne: true } };
  if (q && typeof q === "string") {
    const rx = new RegExp(q.trim(), "i");
    filter.$or = [{ title: rx }, { sku: rx }];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
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
    Product.countDocuments(filter),
  ]);

  const now = new Date();
  const nowDateStr = now.toISOString().split("T")[0];
  const nowTimeStr = now.toISOString().split("T")[1].substring(0, 5);

  const isDiscountActive = (d: any): boolean => {
    if (d.startDate && d.startDate > nowDateStr) return false;
    if (d.startDate === nowDateStr && d.startTime && d.startTime > nowTimeStr) return false;
    if (!d.setEndDate || !d.endDate) return true;
    if (d.endDate > nowDateStr) return true;
    if (d.endDate === nowDateStr && d.endTime && d.endTime >= nowTimeStr) return true;
    if (d.endDate === nowDateStr && !d.endTime) return true;
    return false;
  };

  const activeProductDiscounts = await AmountOffProductsDiscount.find({
    storeId,
    status: "active",
  }).lean();

  const validProductDiscounts = activeProductDiscounts.filter(isDiscountActive);

  const productDiscountIds = validProductDiscounts.map((d: any) => d._id);
  const productDiscountEntries =
    productDiscountIds.length > 0
      ? await AmountOffProductsEntry.find({
          storeId,
          discountId: { $in: productDiscountIds },
        }).lean()
      : [];

  const entriesByDiscount = new Map<string, any[]>();
  for (const entry of productDiscountEntries) {
    const key = String(entry.discountId);
    if (!entriesByDiscount.has(key)) entriesByDiscount.set(key, []);
    entriesByDiscount.get(key)!.push(entry);
  }

  const collectionIdsInEntries = productDiscountEntries
    .filter((e: any) => e.collectionId)
    .map((e: any) => e.collectionId);

  const collectionProductMap = new Map<string, string[]>();
  if (collectionIdsInEntries.length > 0) {
    const collectionEntries = await CollectionEntry.find({
      collectionId: { $in: collectionIdsInEntries },
    }).lean();
    for (const ce of collectionEntries) {
      const colKey = String(ce.collectionId);
      if (!collectionProductMap.has(colKey)) collectionProductMap.set(colKey, []);
      collectionProductMap.get(colKey)!.push(String(ce.productId));
    }
  }

  const productDiscountMap = new Map<
    string,
    {
      valueType: "percentage" | "fixed-amount";
      percentage?: number;
      fixedAmount?: number;
      title?: string;
      method: "automatic" | "discount-code";
      discountCode?: string;
    }
  >();

  for (const discount of validProductDiscounts) {
    const discountId = String(discount._id);
    const entries = entriesByDiscount.get(discountId) || [];

    const applicableProductIds: string[] = [];

    for (const entry of entries) {
      if (entry.productId) {
        applicableProductIds.push(String(entry.productId));
      } else if (entry.collectionId) {
        const productsInCollection = collectionProductMap.get(String(entry.collectionId)) || [];
        applicableProductIds.push(...productsInCollection);
      }
    }

    for (const productId of applicableProductIds) {
      const existing = productDiscountMap.get(productId);
      const newDiscount = {
        valueType: (discount as any).valueType as "percentage" | "fixed-amount",
        percentage: (discount as any).percentage,
        fixedAmount: (discount as any).fixedAmount,
        title: (discount as any).title,
        method: (discount as any).method as "automatic" | "discount-code",
        discountCode: (discount as any).discountCode,
      };

      if (!existing) {
        productDiscountMap.set(productId, newDiscount);
      } else {
        const existingValue =
          existing.valueType === "percentage" ? existing.percentage || 0 : existing.fixedAmount || 0;
        const newValue =
          newDiscount.valueType === "percentage" ? newDiscount.percentage || 0 : newDiscount.fixedAmount || 0;

        if (existing.valueType === newDiscount.valueType) {
          if (newValue > existingValue) {
            productDiscountMap.set(productId, newDiscount);
          }
        } else if (newDiscount.valueType === "fixed-amount" && newValue > existingValue) {
          productDiscountMap.set(productId, newDiscount);
        }
      }
    }
  }

  const activeOrderDiscounts = await AmountOffOrderDiscount.find({
    storeId,
    status: "active",
    method: "automatic",
  }).lean();

  const validOrderDiscounts = activeOrderDiscounts.filter(isDiscountActive);

  let bestOrderDiscount: {
    valueType: "percentage" | "fixed-amount";
    percentage?: number;
    fixedAmount?: number;
    title?: string;
    minimumPurchase?: string;
    minimumAmount?: number;
    minimumQuantity?: number;
  } | null = null;

  for (const discount of validOrderDiscounts) {
    const d = discount as any;
    const newDiscount = {
      valueType: d.valueType as "percentage" | "fixed-amount",
      percentage: d.percentage,
      fixedAmount: d.fixedAmount,
      title: d.title,
      minimumPurchase: d.minimumPurchase,
      minimumAmount: d.minimumAmount,
      minimumQuantity: d.minimumQuantity,
    };

    if (!bestOrderDiscount) {
      bestOrderDiscount = newDiscount;
    } else {
      const existingValue =
        bestOrderDiscount.valueType === "percentage"
          ? bestOrderDiscount.percentage || 0
          : bestOrderDiscount.fixedAmount || 0;
      const newValue =
        newDiscount.valueType === "percentage" ? newDiscount.percentage || 0 : newDiscount.fixedAmount || 0;

      if (newValue > existingValue) {
        bestOrderDiscount = newDiscount;
      }
    }
  }

  const publicOrigin = publicOriginFromRequest(req);
  const enrichedProducts = products.map((product: any) => {
    const productId = String(product._id);
    const discount = productDiscountMap.get(productId);
    return {
      ...product,
      imageUrls: absolutizeImageUrlsArray(publicOrigin, product.imageUrls),
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
export const getProductsInCollectionByUrlHandle = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, urlHandle } = req.params;
  assertValidStoreId(storeId);
  if (!urlHandle?.trim()) throw new CustomError("urlHandle is required", 400);

  const collection = await Collections.findOne({
    storeId,
    urlHandle: normalizeUrlHandle(urlHandle),
    status: "published",
  })
    .select("_id storeId")
    .lean();

  if (!collection) {
    throw new CustomError("Collection not found", 404);
  }

  await sendStorefrontCollectionProductsResponse(req, res, collection._id, collection.storeId);
});

// Get products inside a collection by id (legacy storefront)
export const getProductsInCollection = asyncErrorHandler(async (req: Request, res: Response) => {
  const { collectionId } = req.params;

  if (!collectionId || !mongoose.isValidObjectId(collectionId)) {
    throw new CustomError("Valid collectionId is required", 400);
  }

  const collection = await Collections.findById(collectionId).select("storeId").lean();
  if (!collection) {
    throw new CustomError("Collection not found", 404);
  }

  await sendStorefrontCollectionProductsResponse(req, res, collection._id, collection.storeId);
});
