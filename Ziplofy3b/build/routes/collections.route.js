"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionsRouter = void 0;
const express_1 = require("express");
const collections_controller_1 = require("../controllers/collections.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.collectionsRouter = (0, express_1.Router)();
exports.collectionsRouter.use(auth_middleware_1.protect);
// GET collections by store
exports.collectionsRouter.get("/store/:storeId", collections_controller_1.getCollectionsByStoreId);
// SEARCH collections with product count
exports.collectionsRouter.get("/search/:storeId", collections_controller_1.searchCollections);
// SEARCH products inside a collection
exports.collectionsRouter.get("/:collectionId/products/search", collections_controller_1.searchProductsInCollection);
// CREATE
exports.collectionsRouter.post("/", collections_controller_1.createCollection);
// UPDATE
exports.collectionsRouter.put("/:id", collections_controller_1.updateCollection);
exports.collectionsRouter.patch("/:id", collections_controller_1.updateCollection);
// DELETE
exports.collectionsRouter.delete("/:id", collections_controller_1.deleteCollection);
