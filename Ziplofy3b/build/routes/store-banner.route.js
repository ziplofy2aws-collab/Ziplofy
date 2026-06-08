"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_banner_controller_1 = require("../controllers/store-banner.controller");
const storeBannerRouter = (0, express_1.Router)();
storeBannerRouter.post('/', store_banner_controller_1.createStoreBanner);
storeBannerRouter.put('/:id', store_banner_controller_1.updateStoreBanner);
storeBannerRouter.get('/store/:storeId', store_banner_controller_1.getStoreBannersByStoreId);
exports.default = storeBannerRouter;
