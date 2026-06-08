"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const country_controller_1 = require("../controllers/country.controller");
const countryRouter = (0, express_1.Router)();
countryRouter.get('/', country_controller_1.getAllCountries);
exports.default = countryRouter;
