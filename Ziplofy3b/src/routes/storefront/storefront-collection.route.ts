import { Router } from "express";
import {
  getCollectionDetailsByUrlHandle,
  getCollectionsByStoreId,
  getProductsInCollection,
  getProductsInCollectionByUrlHandle,
} from "../../controllers/storefront-collection.controller";

export const storeFrontCollectionRouter = Router();

storeFrontCollectionRouter.get("/store/:storeId", getCollectionsByStoreId);
storeFrontCollectionRouter.get("/store/:storeId/url-handle/:urlHandle", getCollectionDetailsByUrlHandle);
storeFrontCollectionRouter.get(
  "/store/:storeId/url-handle/:urlHandle/products",
  getProductsInCollectionByUrlHandle
);

/** @deprecated Prefer url-handle routes; kept for older clients. */
storeFrontCollectionRouter.get("/:collectionId/products", getProductsInCollection);