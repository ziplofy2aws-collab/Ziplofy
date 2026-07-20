import { Router } from "express";
import {
  createStorefrontBlogComment,
  getPublishedCommentsForArticle,
} from "../../controllers/blog-comment.controller";

export const storeFrontBlogCommentRouter = Router();

storeFrontBlogCommentRouter.get(
  "/store/:storeId/article/:articleId",
  getPublishedCommentsForArticle
);
storeFrontBlogCommentRouter.post("/", createStorefrontBlogComment);
