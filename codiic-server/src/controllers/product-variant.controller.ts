import { Request, Response } from "express";
import mongoose from "mongoose";
import { SecureUserInfo } from "../middlewares/auth.middleware";
import { ProductVariant } from "../models/product/product-variants.model";
import { Product } from "../models/product/product.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { assertStoreAccess } from "../utils/store-access.util";
import { assertStoreCloudImageUrls } from "../utils/cloud-storage-image.util";

const VARIANT_UPDATE_FIELDS = [
  "sku",
  "barcode",
  "price",
  "compareAtPrice",
  "cost",
  "profit",
  "marginPercent",
  "unitPriceTotalAmount",
  "unitPriceTotalAmountMetric",
  "unitPriceBaseMeasure",
  "unitPriceBaseMeasureMetric",
  "chargeTax",
  "weightValue",
  "weightUnit",
  "package",
  "countryOfOrigin",
  "hsCode",
  "images",
  "outOfStockContinueSelling",
  "isInventoryTrackingEnabled",
  "isPhysicalProduct",
] as const;

function buildVariantUpdatePayload(body: Record<string, unknown>): Record<string, unknown> {
  const updatePayload: Record<string, unknown> = {};

  for (const field of VARIANT_UPDATE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    updatePayload[field] = body[field];
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "package")) {
    const pkg = updatePayload.package;
    if (pkg === null || pkg === "") {
      updatePayload.package = null;
    } else if (typeof pkg === "string" && !mongoose.isValidObjectId(pkg)) {
      throw new CustomError("Invalid package id", 400);
    }
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "sku")) {
    const sku = String(updatePayload.sku ?? "").trim();
    if (!sku) throw new CustomError("SKU is required", 400);
    updatePayload.sku = sku;
  }

  return updatePayload;
}

// GET variants by product id
export const getVariantsByProductId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    throw new CustomError("productId is required", 400);
  }

  const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true } }).select("_id");
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  const variants = await ProductVariant.find({ productId, depricated: false })
    .populate({ path: 'package', model: 'Packaging' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: variants,
    count: variants.length,
  });
});

// GET single variant by id (protected route)
export const getVariantById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { productId } = req.query as { productId?: string };
  if (!id) {
    throw new CustomError("variant id is required", 400);
  }

  const variant = await ProductVariant.findOne({ _id: id, depricated: false })
    .populate({ path: 'package', model: 'Packaging' });

  if (!variant) {
    throw new CustomError("Variant not found", 404);
  }

  if (productId && String(variant.productId) !== String(productId)) {
    throw new CustomError("Variant does not belong to the provided product", 400);
  }

  const product = await Product.findOne({ _id: variant.productId, isDeleted: { $ne: true } }).select("_id");
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: variant,
  });
});

// PATCH update variant by id
export const updateVariantById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid variant id is required", 400);
  }

  const updateData = buildVariantUpdatePayload(req.body as Record<string, unknown>);
  if (!Object.keys(updateData).length) {
    throw new CustomError("No valid fields provided for update", 400);
  }

  const existingVariant = await ProductVariant.findOne({ _id: id, depricated: false });
  if (!existingVariant) {
    throw new CustomError("Variant not found", 404);
  }

  const product = await Product.findOne({ _id: existingVariant.productId, isDeleted: { $ne: true } }).select("storeId");
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  await assertStoreAccess(product.storeId.toString(), req.user as SecureUserInfo | undefined);

  if (Array.isArray(updateData.images)) {
    await assertStoreCloudImageUrls(product.storeId.toString(), updateData.images as string[]);
  }

  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate({ path: "package", model: "Packaging" });

  if (!updatedVariant) {
    throw new CustomError("Variant not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedVariant,
    message: "Variant updated successfully",
  });
});

// Public route for getting variants by product id
export const getVariantsByProductIdPublic = asyncErrorHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    throw new CustomError("productId is required", 400);
  }

  const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true } }).select("_id");
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  const variants = await ProductVariant.find({ productId, depricated: false })
    .select({
      cost: 0,
      profit: 0,
      marginPercent: 0,
      unitPriceTotalAmount: 0,
      unitPriceTotalAmountMetric: 0,
      unitPriceBaseMeasure: 0,
      unitPriceBaseMeasureMetric: 0,
      hsCode: 0,
      isInventoryTrackingEnabled: 0,
    })

  res.status(200).json({
    success: true,
    data: variants,
    count: variants.length,
  });
});

// Public route for getting single variant by id
export const getVariantByIdPublic = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { productId } = req.query as { productId?: string };

  if (!id) {
    throw new CustomError("variant id is required", 400);
  }

  const variant = await ProductVariant.findOne({ _id: id, depricated: false })
    .select({
      cost: 0,
      profit: 0,
      marginPercent: 0,
      unitPriceTotalAmount: 0,
      unitPriceTotalAmountMetric: 0,
      unitPriceBaseMeasure: 0,
      unitPriceBaseMeasureMetric: 0,
      hsCode: 0,
      isInventoryTrackingEnabled: 0,
    });

  if (!variant) {
    throw new CustomError("Variant not found", 404);
  }

  if (productId && String(variant.productId) !== String(productId)) {
    throw new CustomError("Variant does not belong to the provided product", 400);
  }

  const product = await Product.findOne({ _id: variant.productId, isDeleted: { $ne: true } }).select("_id");
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: variant,
  });
});
