"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currency_controller_1 = require("../controllers/currency.controller");
const currencyRouter = (0, express_1.Router)();
currencyRouter.get('/', currency_controller_1.getCurrencies);
exports.default = currencyRouter;
