import { Router } from "express";
import {
    getVariantById,
    getVariantsByProductId,
    getVariantsByProductIdPublic,
    updateVariantById
} from "../controllers/product-variant.controller";
import { protect } from "../middlewares/auth.middleware";

export const productVariantRouter = Router();

// Public route for getting variants by product id
productVariantRouter.get("/public/product/:productId", getVariantsByProductIdPublic);

// Protect all variant routes
productVariantRouter.use(protect);

// GET variants by product id
productVariantRouter.get("/product/:productId", getVariantsByProductId);

// GET single variant by id
productVariantRouter.get("/:id", getVariantById);

// PATCH update variant by id
productVariantRouter.patch("/:id", updateVariantById);
