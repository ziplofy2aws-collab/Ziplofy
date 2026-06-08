"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSubdomainRouter = void 0;
const express_1 = require("express");
const store_subdomain_controller_1 = require("../controllers/store-subdomain.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.storeSubdomainRouter = (0, express_1.Router)();
// Public: validate a subdomain and return store info
exports.storeSubdomainRouter.get('/check', store_subdomain_controller_1.checkSubdomain);
// Protected: get mapping by store id
exports.storeSubdomainRouter.use(auth_middleware_1.protect);
exports.storeSubdomainRouter.get('/store/:storeId', store_subdomain_controller_1.getSubdomainByStoreId);
