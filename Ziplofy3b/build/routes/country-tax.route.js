"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryTaxRouter = void 0;
const express_1 = require("express");
const country_tax_controller_1 = require("../controllers/country-tax.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.countryTaxRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.countryTaxRouter.use(auth_middleware_1.protect);
// Get country tax by country ID
exports.countryTaxRouter.get("/:countryId", country_tax_controller_1.getCountryTaxByCountryId);
