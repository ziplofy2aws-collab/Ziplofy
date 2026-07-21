import { Router } from "express";
import { getBaseCategories, getCategoriesByParentId } from "../controllers/category.controller";
import { protect } from "../middlewares/auth.middleware";

export const categoryRouter = Router();

// Protected routes (authentication required) — adjust if public access is desired
categoryRouter.use(protect);

// Get base categories (parent === null)
categoryRouter.get("/base", getBaseCategories);

// Get categories by parent id
categoryRouter.get("/parent/:parentId", getCategoriesByParentId);


