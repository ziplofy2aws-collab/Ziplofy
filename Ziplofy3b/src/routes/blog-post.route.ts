import { Router } from "express";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  getBlogPostsByStoreId,
  updateBlogPost,
} from "../controllers/blog-post.controller";
import { protect } from "../middlewares/auth.middleware";

export const blogPostRouter = Router();

blogPostRouter.use(protect);

blogPostRouter.get("/store/:storeId", getBlogPostsByStoreId);
blogPostRouter.get("/:id", getBlogPostById);
blogPostRouter.post("/", createBlogPost);
blogPostRouter.put("/:id", updateBlogPost);
blogPostRouter.patch("/:id", updateBlogPost);
blogPostRouter.delete("/:id", deleteBlogPost);
