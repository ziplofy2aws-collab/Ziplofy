import { Router } from "express";
import { addTag, getTagsByStoreId, deleteTag } from "../controllers/tags.controller";
import { protect } from "../middlewares/auth.middleware";

export const tagsRouter = Router();

tagsRouter.use(protect);

// GET /api/tags/store/:storeId - Get tags by store ID
tagsRouter.get("/store/:storeId", getTagsByStoreId);

// POST /api/tags - Add a new tag
tagsRouter.post("/", addTag);

// DELETE /api/tags/:id - Delete a tag by ID
tagsRouter.delete("/:id", deleteTag);
