"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryTaxByCountryId = void 0;
const country_tax_model_1 = require("../models/country-tax/country-tax.model");
const country_model_1 = require("../models/country/country.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Get country tax by country ID
exports.getCountryTaxByCountryId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { countryId } = req.params;
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID format", 400);
    }
    const countryObjectId = new mongoose_1.default.Types.ObjectId(countryId);
    // Verify that the country exists
    const country = await country_model_1.Country.findById(countryObjectId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Get country tax for this country
    const countryTax = await country_tax_model_1.CountryTax.findOne({
        countryId: countryObjectId,
    })
        .populate("countryId", "name iso2 iso3")
        .lean();
    if (!countryTax) {
        throw new error_utils_1.CustomError("Country tax not found for this country", 404);
    }
    res.status(200).json({
        success: true,
        data: countryTax,
        message: "Country tax retrieved successfully",
    });
});
