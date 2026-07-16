import { Router } from "express";
import { searchStorefrontProducts } from "../../controllers/storefront-products.controller";

/**
 * Base path: /api/storefront/products
 */
export const storeFrontProductsRouter = Router();

storeFrontProductsRouter.get("/store/:storeId/search", searchStorefrontProducts);
