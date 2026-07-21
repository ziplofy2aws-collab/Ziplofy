import { Router } from "express";
import {
  getBlogByUrlHandle,
  getVisiblePostByUrlHandles,
  getVisiblePostsByBlogUrlHandle,
  listBlogsByStoreId,
} from "../../controllers/storefront-blog.controller";

export const storeFrontBlogRouter = Router();

storeFrontBlogRouter.get("/store/:storeId", listBlogsByStoreId);
storeFrontBlogRouter.get("/store/:storeId/url-handle/:urlHandle", getBlogByUrlHandle);
storeFrontBlogRouter.get(
  "/store/:storeId/url-handle/:urlHandle/posts",
  getVisiblePostsByBlogUrlHandle
);
storeFrontBlogRouter.get(
  "/store/:storeId/url-handle/:blogHandle/posts/:postHandle",
  getVisiblePostByUrlHandles
);
