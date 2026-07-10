import { Router } from "express";
import { createCollection, deleteCollection, duplicateCollection, getCollectionsByStoreId, getCollectionThemeTemplates, searchCollections, searchProductsInCollection, updateCollection } from "../controllers/collections.controller";
import { protect } from "../middlewares/auth.middleware";

export const collectionsRouter = Router();

collectionsRouter.use(protect);

// GET collection theme templates by store
collectionsRouter.get("/theme-templates/store/:storeId", getCollectionThemeTemplates);

// GET collections by store
collectionsRouter.get("/store/:storeId", getCollectionsByStoreId);

// SEARCH collections with product count
collectionsRouter.get("/search/:storeId", searchCollections);

// SEARCH products inside a collection
collectionsRouter.get("/:collectionId/products/search", searchProductsInCollection);

// CREATE
collectionsRouter.post("/", createCollection);

// DUPLICATE
collectionsRouter.post("/:id/duplicate", duplicateCollection);

// UPDATE
collectionsRouter.put("/:id", updateCollection);
collectionsRouter.patch("/:id", updateCollection);

// DELETE
collectionsRouter.delete("/:id", deleteCollection);


