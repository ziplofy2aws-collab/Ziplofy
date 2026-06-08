"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateById = exports.getStatesByCountryId = exports.getAllStates = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const state_model_1 = require("../models/state/state.model");
const country_model_1 = require("../models/country/country.model");
const error_utils_1 = require("../utils/error.utils");
// GET /states
exports.getAllStates = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { countryId, countryIso2, q, limit = '500', page = '1' } = req.query;
    const numericLimit = Math.min(Math.max(parseInt(String(limit), 10) || 500, 1), 1000);
    const numericPage = Math.max(parseInt(String(page), 10) || 1, 1);
    const filter = {};
    if (countryId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
            throw new error_utils_1.CustomError('Invalid country ID', 400);
        }
        filter.countryId = countryId;
    }
    if (countryIso2) {
        filter.countryIso2 = countryIso2.toUpperCase();
    }
    if (q && q.trim()) {
        const term = q.trim();
        filter.$or = [
            { name: { $regex: term, $options: 'i' } },
            { code: { $regex: term, $options: 'i' } },
        ];
    }
    const [items, total] = await Promise.all([
        state_model_1.State.find(filter)
            .populate('countryId', 'name iso2 iso3')
            .sort({ name: 1 })
            .skip((numericPage - 1) * numericLimit)
            .limit(numericLimit)
            .lean(),
        state_model_1.State.countDocuments(filter),
    ]);
    return res.status(200).json({
        success: true,
        data: items,
        message: 'States fetched successfully',
        meta: { total, page: numericPage, limit: numericLimit },
    });
});
// GET /states/country/:countryId
exports.getStatesByCountryId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { countryId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError('Invalid country ID', 400);
    }
    // Verify country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError('Country not found', 404);
    }
    const states = await state_model_1.State.find({ countryId })
        .populate('countryId', 'name iso2 iso3')
        .sort({ name: 1 })
        .lean();
    return res.status(200).json({
        success: true,
        data: states,
        message: 'States fetched successfully',
        meta: {
            total: states.length,
            country: {
                id: country._id,
                name: country.name,
                iso2: country.iso2,
            },
        },
    });
});
// GET /states/:id
exports.getStateById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError('Invalid state ID', 400);
    }
    const state = await state_model_1.State.findById(id).populate('countryId', 'name iso2 iso3').lean();
    if (!state) {
        throw new error_utils_1.CustomError('State not found', 404);
    }
    const country = state.countryId && typeof state.countryId === 'object' && 'name' in state.countryId
        ? state.countryId
        : null;
    return res.status(200).json({
        success: true,
        data: state,
        message: 'State fetched successfully',
        meta: {
            country: country ? {
                id: country._id,
                name: country.name,
                iso2: country.iso2,
            } : undefined,
        },
    });
});
