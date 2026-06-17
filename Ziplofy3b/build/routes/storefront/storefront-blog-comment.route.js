"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFrontBlogCommentRouter = void 0;
const express_1 = require("express");
const blog_comment_controller_1 = require("../../controllers/blog-comment.controller");
exports.storeFrontBlogCommentRouter = (0, express_1.Router)();
exports.storeFrontBlogCommentRouter.get("/store/:storeId/article/:articleId", blog_comment_controller_1.getPublishedCommentsForArticle);
exports.storeFrontBlogCommentRouter.post("/", blog_comment_controller_1.createStorefrontBlogComment);
