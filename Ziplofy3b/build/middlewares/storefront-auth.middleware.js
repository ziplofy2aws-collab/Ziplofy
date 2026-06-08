"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontProtect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const error_utils_1 = require("../utils/error.utils");
const storefrontProtect = async (req, res, next) => {
    try {
        const token = (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
        if (!token)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const customer = await models_1.Customer.findById(decoded._id).select('-password').lean();
        if (!customer)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        req.storefrontUser = {
            ...customer,
            defaultAddress: customer.defaultAddress?.toString(),
        };
        next();
    }
    catch (err) {
        next(new error_utils_1.CustomError('Unauthorized', 401));
    }
};
exports.storefrontProtect = storefrontProtect;
