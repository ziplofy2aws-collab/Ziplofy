import { Request, Response } from "express";
import { ProductVariant } from "../models/product/product-variants.model";
import { Product } from "../models/product/product.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

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

// PUT update variant by id
export const updateVariantById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    throw new CustomError("Variant id is required", 400);
  }

  // Validate that variant exists
  const existingVariant = await ProductVariant.findById(id);
  if (!existingVariant) {
    throw new CustomError("Variant not found", 404);
  }

  // Update the variant with new data
  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    id,
    updateData,
    { 
      new: true, 
      runValidators: true 
    }
  ).populate({ path: 'package', model: 'Packaging' });

  res.status(200).json({
    success: true,
    data: updatedVariant,
    message: 'Variant updated successfully',
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
