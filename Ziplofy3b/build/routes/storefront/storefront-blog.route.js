"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFrontBlogRouter = void 0;
const express_1 = require("express");
const storefront_blog_controller_1 = require("../../controllers/storefront-blog.controller");
exports.storeFrontBlogRouter = (0, express_1.Router)();
exports.storeFrontBlogRouter.get("/store/:storeId/url-handle/:urlHandle", storefront_blog_controller_1.getBlogByUrlHandle);
exports.storeFrontBlogRouter.get("/store/:storeId/url-handle/:urlHandle/posts", storefront_blog_controller_1.getVisiblePostsByBlogUrlHandle);
exports.storeFrontBlogRouter.get("/store/:storeId/url-handle/:blogHandle/posts/:postHandle", storefront_blog_controller_1.getVisiblePostByUrlHandles);
