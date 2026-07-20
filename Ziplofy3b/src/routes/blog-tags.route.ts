import { Router } from "express";
import {
  createBlogTag,
  deleteBlogTag,
  getBlogTagsByStoreId,
  searchBlogTags,
  updateBlogTag,
} from "../controllers/blog-tags.controller";
import { protect } from "../middlewares/auth.middleware";

export const blogTagsRouter = Router();

blogTagsRouter.use(protect);

blogTagsRouter.get("/search/:storeId", searchBlogTags);
blogTagsRouter.get("/store/:storeId", getBlogTagsByStoreId);
blogTagsRouter.post("/", createBlogTag);
blogTagsRouter.patch("/:id", updateBlogTag);
blogTagsRouter.put("/:id", updateBlogTag);
blogTagsRouter.delete("/:id", deleteBlogTag);
