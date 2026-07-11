import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogsByStoreId,
  updateBlog,
} from "../controllers/blog.controller";
import { protect } from "../middlewares/auth.middleware";

export const blogRouter = Router();

blogRouter.use(protect);

blogRouter.get("/store/:storeId", getBlogsByStoreId);
blogRouter.get("/:id", getBlogById);
blogRouter.post("/", createBlog);
blogRouter.put("/:id", updateBlog);
blogRouter.patch("/:id", updateBlog);
blogRouter.delete("/:id", deleteBlog);
