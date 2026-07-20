import { Request, Response } from "express";
import { Category } from "../models/category/category.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Get all base (root-level) categories (parent === null)
export const getBaseCategories = asyncErrorHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ parent: null }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: categories,
    count: categories.length,
  });
});

// Get categories by parent id
export const getCategoriesByParentId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { parentId } = req.params;

  if (!parentId) {
    throw new CustomError("Parent id is required", 400);
  }

  const categories = await Category.find({ parent: parentId }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: categories,
    count: categories.length,
  });
});


