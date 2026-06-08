import { Request, Response } from "express";
import { CountryTax } from "../models/country-tax/country-tax.model";
import { Country } from "../models/country/country.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Get country tax by country ID
export const getCountryTaxByCountryId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { countryId } = req.params;

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID format", 400);
  }

  const countryObjectId = new mongoose.Types.ObjectId(countryId);

  // Verify that the country exists
  const country = await Country.findById(countryObjectId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Get country tax for this country
  const countryTax = await CountryTax.findOne({
    countryId: countryObjectId,
  })
    .populate("countryId", "name iso2 iso3")
    .lean();

  if (!countryTax) {
    throw new CustomError("Country tax not found for this country", 404);
  }

  res.status(200).json({
    success: true,
    data: countryTax,
    message: "Country tax retrieved successfully",
  });
});

