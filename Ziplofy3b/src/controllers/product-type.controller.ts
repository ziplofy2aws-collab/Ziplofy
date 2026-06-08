import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ProductType } from '../models/product-type/product-type.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Create product type
export const createProductType = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body;

  if (!storeId || !name) {
    throw new CustomError('storeId and name are required', 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const productType = await ProductType.create({ storeId, name });

  res.status(201).json({
    success: true,
    data: productType,
    message: 'Product type created successfully'
  });
});

// Get product types by store ID
export const getProductTypesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const productTypes = await ProductType.find({ storeId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: productTypes,
    count: productTypes.length,
    message: 'Product types fetched successfully'
  });
});

// Delete product type
export const deleteProductType = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid product type ID is required', 400);
  }

  const productType = await ProductType.findByIdAndDelete(id);

  if (!productType) {
    throw new CustomError('Product type not found', 404);
  }

  res.status(200).json({
    success: true,
    data: productType,
    message: 'Product type deleted successfully'
  });
});
