"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_branding_controller_1 = require("../controllers/store-branding.controller");
const storeBrandingRouter = (0, express_1.Router)();
storeBrandingRouter.post('/', store_branding_controller_1.createStoreBranding);
storeBrandingRouter.put('/:id', store_branding_controller_1.updateStoreBranding);
storeBrandingRouter.get('/store/:storeId', store_branding_controller_1.getStoreBrandingByStoreId);
exports.default = storeBrandingRouter;
