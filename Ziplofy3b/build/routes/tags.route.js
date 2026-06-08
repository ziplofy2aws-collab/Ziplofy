"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsRouter = void 0;
const express_1 = require("express");
const tags_controller_1 = require("../controllers/tags.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.tagsRouter = (0, express_1.Router)();
exports.tagsRouter.use(auth_middleware_1.protect);
// GET /api/tags/store/:storeId - Get tags by store ID
exports.tagsRouter.get("/store/:storeId", tags_controller_1.getTagsByStoreId);
// POST /api/tags - Add a new tag
exports.tagsRouter.post("/", tags_controller_1.addTag);
// DELETE /api/tags/:id - Delete a tag by ID
exports.tagsRouter.delete("/:id", tags_controller_1.deleteTag);
