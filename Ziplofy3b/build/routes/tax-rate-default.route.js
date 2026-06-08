"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRateDefaultRouter = void 0;
const express_1 = require("express");
const tax_rate_default_controller_1 = require("../controllers/tax-rate-default.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.taxRateDefaultRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.taxRateDefaultRouter.use(auth_middleware_1.protect);
// Get tax default by country ID and state ID (must come before /country/:countryId to avoid route conflicts)
exports.taxRateDefaultRouter.get("/country/:countryId/state/:stateId", tax_rate_default_controller_1.getTaxDefaultByCountryAndState);
// Get tax defaults by country ID (with optional filter: ?stateId=xxx)
exports.taxRateDefaultRouter.get("/country/:countryId", tax_rate_default_controller_1.getTaxDefaultsByCountryId);
// Get tax default by ID
exports.taxRateDefaultRouter.get("/:id", tax_rate_default_controller_1.getTaxDefaultById);
