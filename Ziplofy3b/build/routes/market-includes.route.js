"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const market_includes_controller_1 = require("../controllers/market-includes.controller");
const marketIncludesRouter = (0, express_1.Router)();
marketIncludesRouter.post('/', market_includes_controller_1.createMarketInclude);
marketIncludesRouter.delete('/:id', market_includes_controller_1.deleteMarketInclude);
marketIncludesRouter.get('/market/:marketId', market_includes_controller_1.getMarketIncludesByMarketId);
exports.default = marketIncludesRouter;
