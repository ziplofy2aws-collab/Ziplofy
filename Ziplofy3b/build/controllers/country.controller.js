"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCountries = void 0;
const country_model_1 = require("../models/country/country.model");
const error_utils_1 = require("../utils/error.utils");
// GET /countries
exports.getAllCountries = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { q, limit = '500', page = '1' } = req.query;
    const numericLimit = Math.min(Math.max(parseInt(String(limit), 10) || 500, 1), 1000);
    const numericPage = Math.max(parseInt(String(page), 10) || 1, 1);
    const filter = {};
    if (q && q.trim()) {
        const term = q.trim();
        filter.$or = [
            { name: { $regex: term, $options: 'i' } },
            { officialName: { $regex: term, $options: 'i' } },
            { iso2: { $regex: term, $options: 'i' } },
            { iso3: { $regex: term, $options: 'i' } },
        ];
    }
    const [items, total] = await Promise.all([
        country_model_1.Country.find(filter)
            .sort({ name: 1 })
            .skip((numericPage - 1) * numericLimit)
            .limit(numericLimit)
            .lean(),
        country_model_1.Country.countDocuments(filter),
    ]);
    return res.status(200).json({
        success: true,
        data: items,
        message: 'Countries fetched successfully',
        meta: { total, page: numericPage, limit: numericLimit },
    });
});
