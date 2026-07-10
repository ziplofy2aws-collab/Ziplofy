import { Router } from "express";
import {
  addOptionToProduct,
  addVariantsToProduct,
  createProduct,
  getProductById,
  deleteVariantsFromProduct,
  getProductByIdPublic,
  getProductsByStoreId,
  getProductsByStoreIdPublic,
  searchProductsBasic,
  searchProductsWithAvailability,
  searchProductsWithVariantAndDestination,
  searchProductsWithVariants,
  softDeleteProductById,
  updateProductById,
} from "../controllers/product.controller";
import { protect } from "../middlewares/auth.middleware";

export const productRouter = Router();

// Public route for getting products by store ID with pagination
productRouter.get("/public/store/:storeId", getProductsByStoreIdPublic);

// Public route for getting product details by product ID
productRouter.get("/public/:productId", getProductByIdPublic);

// Protect all product routes (adjust if public create not desired)
productRouter.use(protect);

// Create product
productRouter.post("/", createProduct);

// Partial update product
productRouter.patch("/:id", updateProductById);

// Soft delete product
productRouter.delete("/:id", softDeleteProductById);

// Get products by store id
productRouter.get("/store/:storeId", getProductsByStoreId);

// add variants to product
productRouter.post("/:id/variants", addVariantsToProduct);

// delete variants from product
productRouter.delete("/:id/variants", deleteVariantsFromProduct);

// add option to existing variant dimension
productRouter.post("/:id/variants/:dimensionName/options", addOptionToProduct);

// delete option from existing variant dimension
// productRouter.delete("/:id/variants/:dimensionName/options", deleteOptionFromVariantDimension);

// search products with availability
productRouter.get("/search", searchProductsWithAvailability);

// search products basic (title + first image + id)
productRouter.get("/search-basic", searchProductsBasic);

// search products with variants (no availability)
productRouter.get("/search-with-variants", searchProductsWithVariants);

// search products with variant and destination availability
productRouter.get("/search-product-with-variant-and-destination", searchProductsWithVariantAndDestination);

// Get single product by id (keep after specific GET routes)
productRouter.get("/:id", getProductById);

