import { Router } from "express";
import {
  createBlogComment,
  deleteBlogComment,
  getBlogCommentsByStoreId,
  updateBlogComment,
} from "../controllers/blog-comment.controller";
import { protect } from "../middlewares/auth.middleware";

export const blogCommentRouter = Router();

blogCommentRouter.use(protect);

blogCommentRouter.get("/store/:storeId", getBlogCommentsByStoreId);
blogCommentRouter.post("/", createBlogComment);
blogCommentRouter.put("/:id", updateBlogComment);
blogCommentRouter.patch("/:id", updateBlogComment);
blogCommentRouter.delete("/:id", deleteBlogComment);
