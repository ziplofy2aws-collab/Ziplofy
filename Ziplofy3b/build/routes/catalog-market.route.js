"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalog_market_controller_1 = require("../controllers/catalog-market.controller");
const catalogMarketRouter = (0, express_1.Router)();
catalogMarketRouter.post('/', catalog_market_controller_1.createCatalogMarket);
catalogMarketRouter.delete('/:id', catalog_market_controller_1.deleteCatalogMarket);
catalogMarketRouter.get('/catalog/:catalogId', catalog_market_controller_1.getCatalogMarketsByCatalogId);
exports.default = catalogMarketRouter;
