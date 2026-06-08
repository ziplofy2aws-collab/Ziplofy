import { Router } from "express";
import { createCollection, deleteCollection,getCollectionsByStoreId, searchCollections, searchProductsInCollection, updateCollection } from "../controllers/collections.controller";
import { protect } from "../middlewares/auth.middleware";

export const collectionsRouter = Router();

collectionsRouter.use(protect);

// GET collections by store
collectionsRouter.get("/store/:storeId", getCollectionsByStoreId);

// SEARCH collections with product count
collectionsRouter.get("/search/:storeId", searchCollections);

// SEARCH products inside a collection
collectionsRouter.get("/:collectionId/products/search", searchProductsInCollection);

// CREATE
collectionsRouter.post("/", createCollection);

// UPDATE
collectionsRouter.put("/:id", updateCollection);
collectionsRouter.patch("/:id", updateCollection);

// DELETE
collectionsRouter.delete("/:id", deleteCollection);


