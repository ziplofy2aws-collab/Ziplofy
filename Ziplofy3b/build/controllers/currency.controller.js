"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencies = getCurrencies;
const currency_model_1 = require("../models/currency/currency.model");
async function getCurrencies(req, res) {
    try {
        const { q, active, limit = '50', page = '1' } = req.query;
        const numericLimit = Math.min(Math.max(parseInt(String(limit), 10) || 50, 1), 500);
        const numericPage = Math.max(parseInt(String(page), 10) || 1, 1);
        const filter = {};
        if (typeof q === 'string' && q.trim()) {
            filter.$or = [
                { code: { $regex: q.trim(), $options: 'i' } },
                { name: { $regex: q.trim(), $options: 'i' } },
                { symbol: { $regex: q.trim(), $options: 'i' } },
            ];
        }
        if (active === 'true' || active === 'false') {
            filter.isActive = active === 'true';
        }
        const [items, total] = await Promise.all([
            currency_model_1.Currency.find(filter)
                .sort({ code: 1 })
                .skip((numericPage - 1) * numericLimit)
                .limit(numericLimit)
                .lean(),
            currency_model_1.Currency.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            data: items,
            message: 'Currencies fetched successfully',
            meta: { total, page: numericPage, limit: numericLimit },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, data: [], message: error?.message || 'Failed to fetch currencies' });
    }
}
