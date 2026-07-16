import { Request, Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product/product.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { absolutizeImageUrlsArray, publicOriginFromRequest } from "../utils/public-origin.util";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertValidStoreId(storeId: string): void {
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
}

/**
 * GET /storefront/products/store/:storeId/search?q=&page=&limit=
 * Public storefront product search (active products only).
 * Empty `q` returns the latest active products (browse / empty-search state).
 */
export const searchStorefrontProducts = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  assertValidStoreId(storeId);

  const {
    q = "",
    page = "1",
    limit = "24",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(48, Math.max(1, parseInt(String(limit), 10) || 24));
  const skip = (pageNum - 1) * limitNum;
  const query = typeof q === "string" ? q.trim() : "";

  const filter: Record<string, unknown> = {
    storeId,
    status: "active",
    isDeleted: { $ne: true },
  };

  if (query) {
    const rx = new RegExp(escapeRegex(query), "i");
    filter.$or = [
      { title: rx },
      { sku: rx },
      { description: rx },
      { pageTitle: rx },
      { urlHandle: rx },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select({
        title: 1,
        description: 1,
        pageTitle: 1,
        metaDescription: 1,
        urlHandle: 1,
        category: 1,
        price: 1,
        compareAtPrice: 1,
        sku: 1,
        status: 1,
        vendor: 1,
        imageUrls: 1,
        inventoryTrackingEnabled: 1,
        continueSellingWhenOutOfStock: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate({ path: "vendor", select: "name" })
      .populate({ path: "category", select: "name" })
      .lean(),
    Product.countDocuments(filter),
  ]);

  const publicOrigin = publicOriginFromRequest(req);
  const data = products.map((product) => ({
    ...product,
    imageUrls: absolutizeImageUrlsArray(publicOrigin, product.imageUrls),
  }));

  res.status(200).json({
    success: true,
    data,
    query,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
      hasNext: skip + data.length < total,
      hasPrev: pageNum > 1,
    },
  });
});
