import { Router } from "express";
import {
  getPageByUrlHandle,
  listPagesByStoreId,
} from "../../controllers/storefront-page.controller";

export const storeFrontPageRouter = Router();

storeFrontPageRouter.get("/store/:storeId", listPagesByStoreId);
storeFrontPageRouter.get("/store/:storeId/url-handle/:urlHandle", getPageByUrlHandle);
