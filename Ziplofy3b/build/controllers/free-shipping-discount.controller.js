"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByFreeShippingDiscount = exports.deleteFreeShippingDiscount = exports.updateFreeShippingDiscount = exports.getFreeShippingDiscountById = exports.getFreeShippingDiscountsByStore = exports.createFreeShippingDiscount = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const free_shipping_discount_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-discount.model");
const free_shipping_country_entry_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-country-entry.model");
const free_shipping_customer_segment_entry_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-customer-segment-entry.model");
const free_shipping_customer_entry_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-customer-entry.model");
const free_shipping_discount_usage_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-discount-usage.model");
exports.createFreeShippingDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, 
    // Method
    method, discountCode, title, 
    // Country
    countrySelection, selectedCountryIds = [], excludeShippingRates, shippingRateLimit, 
    // Eligibility
    eligibility, applyOnPOSPro, 
    // Minimum purchase
    minimumPurchase, minimumAmount, minimumQuantity, 
    // Sales channel (discount-code only)
    allowDiscountOnChannels, 
    // Limits (discount-code only)
    limitTotalUses, totalUsesLimit, limitOneUsePerCustomer, 
    // Combinations
    productDiscounts, orderDiscounts, 
    // Active dates
    startDate, startTime, setEndDate, endDate, endTime, status = 'active', 
    // eligibility targets
    targetCustomerSegmentIds = [], targetCustomerIds = [], } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const discount = await free_shipping_discount_model_1.FreeShippingDiscount.create({
        storeId,
        method,
        ...(method === 'discount-code' && { discountCode }),
        ...(method === 'automatic' && { title }),
        countrySelection,
        excludeShippingRates,
        shippingRateLimit,
        eligibility,
        applyOnPOSPro,
        minimumPurchase,
        minimumAmount,
        minimumQuantity,
        allowDiscountOnChannels,
        limitTotalUses,
        totalUsesLimit,
        limitOneUsePerCustomer,
        productDiscounts,
        orderDiscounts,
        startDate,
        startTime,
        setEndDate,
        endDate,
        endTime,
        status,
    });
    if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
        const validSegmentIds = targetCustomerSegmentIds.filter((sid) => mongoose_1.default.isValidObjectId(sid));
        if (validSegmentIds.length > 0) {
            await free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.insertMany(validSegmentIds.map((sid) => ({ storeId, discountId: discount._id, customerSegmentId: sid })));
        }
    }
    if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
        const validCustomerIds = targetCustomerIds.filter((cid) => mongoose_1.default.isValidObjectId(cid));
        if (validCustomerIds.length > 0) {
            await free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.insertMany(validCustomerIds.map((cid) => ({ storeId, discountId: discount._id, customerId: cid })));
        }
    }
    if (countrySelection === 'selected-countries' && Array.isArray(selectedCountryIds) && selectedCountryIds.length > 0) {
        const validIds = selectedCountryIds.filter((cid) => mongoose_1.default.isValidObjectId(cid));
        if (validIds.length > 0) {
            await free_shipping_country_entry_model_1.FreeShippingCountryEntry.insertMany(validIds.map((cid) => ({ storeId, discountId: discount._id, countryId: cid })));
        }
    }
    const discountLean = await free_shipping_discount_model_1.FreeShippingDiscount.findById(discount._id).lean();
    const countryEntries = await free_shipping_country_entry_model_1.FreeShippingCountryEntry.find({ storeId, discountId: discount._id })
        .populate('countryId', 'name iso2')
        .lean();
    const selectedCountryIdsRes = countryEntries.map((e) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
    const selectedCountries = countryEntries.map((e) => e.countryId).filter(Boolean);
    res.status(201).json({
        success: true,
        message: 'Free shipping discount created successfully',
        data: { ...discountLean, selectedCountryIds: selectedCountryIdsRes, selectedCountries },
    });
});
exports.getFreeShippingDiscountsByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id: storeId } = req.params;
    const { page = 1, limit = 10, status, method } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const filter = { storeId };
    if (status)
        filter.status = status;
    if (method)
        filter.method = method;
    const [discounts, total] = await Promise.all([
        free_shipping_discount_model_1.FreeShippingDiscount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        free_shipping_discount_model_1.FreeShippingDiscount.countDocuments(filter),
    ]);
    const discountIds = discounts.map(d => d._id);
    const [segmentEntries, customerEntries, countryEntries] = await Promise.all([
        free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerSegmentId', 'name').lean(),
        free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerId', 'firstName lastName email').lean(),
        free_shipping_country_entry_model_1.FreeShippingCountryEntry.find({ storeId, discountId: { $in: discountIds } }).populate('countryId', 'name iso2').lean(),
    ]);
    const segmentBy = segmentEntries.reduce((m, e) => { var _a; (m[_a = String(e.discountId)] || (m[_a] = [])).push(e); return m; }, {});
    const customerBy = customerEntries.reduce((m, e) => { var _a; (m[_a = String(e.discountId)] || (m[_a] = [])).push(e); return m; }, {});
    const countryBy = countryEntries.reduce((m, e) => { var _a; (m[_a = String(e.discountId)] || (m[_a] = [])).push(e); return m; }, {});
    const data = discounts.map(d => {
        const segmentList = segmentBy[String(d._id)] || [];
        const customerList = customerBy[String(d._id)] || [];
        const targetCustomerSegmentIds = segmentList.map((e) => e.customerSegmentId).filter(Boolean);
        const targetCustomerIds = customerList.map((e) => e.customerId).filter(Boolean);
        const countryList = countryBy[String(d._id)] || [];
        const selectedCountryIds = countryList.map((e) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
        const selectedCountries = countryList.map((e) => e.countryId).filter(Boolean);
        return {
            ...d,
            targetCustomerSegmentIds,
            targetCustomerIds,
            selectedCountryIds,
            selectedCountries,
        };
    });
    res.status(200).json({
        success: true,
        data,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
        },
    });
});
exports.getFreeShippingDiscountById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await free_shipping_discount_model_1.FreeShippingDiscount.findById(id).lean();
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const storeId = discount.storeId.toString();
    const [segmentEntries, customerEntries, countryEntries] = await Promise.all([
        free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.find({ storeId, discountId: id }).populate('customerSegmentId', 'name').lean(),
        free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.find({ storeId, discountId: id }).populate('customerId', 'firstName lastName email').lean(),
        free_shipping_country_entry_model_1.FreeShippingCountryEntry.find({ storeId, discountId: id }).populate('countryId', 'name iso2').lean(),
    ]);
    const targetCustomerSegmentIds = segmentEntries.map((e) => e.customerSegmentId).filter(Boolean);
    const targetCustomerIds = customerEntries.map((e) => e.customerId).filter(Boolean);
    const selectedCountryIds = countryEntries.map((e) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
    const selectedCountries = countryEntries.map((e) => e.countryId).filter(Boolean);
    res.status(200).json({
        success: true,
        data: {
            ...discount,
            targetCustomerSegmentIds,
            targetCustomerIds,
            selectedCountryIds,
            selectedCountries,
        },
    });
});
exports.updateFreeShippingDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await free_shipping_discount_model_1.FreeShippingDiscount.findById(id);
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const { method, discountCode, title, countrySelection, selectedCountryIds = [], excludeShippingRates, shippingRateLimit, eligibility, applyOnPOSPro, minimumPurchase, minimumAmount, minimumQuantity, allowDiscountOnChannels, limitTotalUses, totalUsesLimit, limitOneUsePerCustomer, productDiscounts, orderDiscounts, startDate, startTime, setEndDate, endDate, endTime, status = 'active', targetCustomerSegmentIds = [], targetCustomerIds = [], } = req.body;
    const storeId = discount.storeId.toString();
    discount.method = method ?? discount.method;
    if (method === 'discount-code')
        discount.discountCode = discountCode ?? discount.discountCode;
    if (method === 'automatic')
        discount.title = title ?? discount.title;
    discount.countrySelection = countrySelection ?? discount.countrySelection;
    discount.excludeShippingRates = excludeShippingRates ?? discount.excludeShippingRates;
    discount.shippingRateLimit = shippingRateLimit ?? discount.shippingRateLimit;
    discount.eligibility = eligibility ?? discount.eligibility;
    discount.applyOnPOSPro = applyOnPOSPro ?? discount.applyOnPOSPro;
    discount.minimumPurchase = minimumPurchase ?? discount.minimumPurchase;
    discount.minimumAmount = minimumAmount ?? discount.minimumAmount;
    discount.minimumQuantity = minimumQuantity ?? discount.minimumQuantity;
    discount.allowDiscountOnChannels = allowDiscountOnChannels ?? discount.allowDiscountOnChannels;
    discount.limitTotalUses = limitTotalUses ?? discount.limitTotalUses;
    discount.totalUsesLimit = totalUsesLimit ?? discount.totalUsesLimit;
    discount.limitOneUsePerCustomer = limitOneUsePerCustomer ?? discount.limitOneUsePerCustomer;
    discount.productDiscounts = productDiscounts ?? discount.productDiscounts;
    discount.orderDiscounts = orderDiscounts ?? discount.orderDiscounts;
    discount.startDate = startDate ?? discount.startDate;
    discount.startTime = startTime ?? discount.startTime;
    discount.setEndDate = setEndDate ?? discount.setEndDate;
    discount.endDate = endDate ?? discount.endDate;
    discount.endTime = endTime ?? discount.endTime;
    discount.status = status ?? discount.status;
    await discount.save();
    if (eligibility !== undefined) {
        await free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.deleteMany({ storeId, discountId: id });
        await free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.deleteMany({ storeId, discountId: id });
        if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
            const validSegmentIds = targetCustomerSegmentIds.filter((sid) => mongoose_1.default.isValidObjectId(sid));
            if (validSegmentIds.length > 0) {
                await free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.insertMany(validSegmentIds.map((sid) => ({ storeId, discountId: id, customerSegmentId: sid })));
            }
        }
        if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
            const validCustomerIds = targetCustomerIds.filter((cid) => mongoose_1.default.isValidObjectId(cid));
            if (validCustomerIds.length > 0) {
                await free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.insertMany(validCustomerIds.map((cid) => ({ storeId, discountId: id, customerId: cid })));
            }
        }
    }
    if (countrySelection !== undefined) {
        await free_shipping_country_entry_model_1.FreeShippingCountryEntry.deleteMany({ storeId, discountId: id });
        if (countrySelection === 'selected-countries' && Array.isArray(selectedCountryIds) && selectedCountryIds.length > 0) {
            const validIds = selectedCountryIds.filter((cid) => mongoose_1.default.isValidObjectId(cid));
            if (validIds.length > 0) {
                await free_shipping_country_entry_model_1.FreeShippingCountryEntry.insertMany(validIds.map((cid) => ({ storeId, discountId: id, countryId: cid })));
            }
        }
    }
    const updated = await free_shipping_discount_model_1.FreeShippingDiscount.findById(id).lean();
    const countryEntries = await free_shipping_country_entry_model_1.FreeShippingCountryEntry.find({ storeId, discountId: id })
        .populate('countryId', 'name iso2')
        .lean();
    const selectedCountryIdsRes = countryEntries.map((e) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
    const selectedCountries = countryEntries.map((e) => e.countryId).filter(Boolean);
    res.status(200).json({
        success: true,
        message: 'Free shipping discount updated successfully',
        data: { ...updated, selectedCountryIds: selectedCountryIdsRes, selectedCountries },
    });
});
exports.deleteFreeShippingDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await free_shipping_discount_model_1.FreeShippingDiscount.findById(id);
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const storeId = discount.storeId.toString();
    await free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.deleteMany({ storeId, discountId: id });
    await free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.deleteMany({ storeId, discountId: id });
    await free_shipping_country_entry_model_1.FreeShippingCountryEntry.deleteMany({ storeId, discountId: id });
    await free_shipping_discount_model_1.FreeShippingDiscount.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Free shipping discount deleted successfully' });
});
/**
 * Get orders where this free shipping discount was used.
 * Returns usage records with populated customer and order info.
 */
exports.getOrdersByFreeShippingDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id: discountId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    if (!discountId || !mongoose_1.default.isValidObjectId(discountId)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await free_shipping_discount_model_1.FreeShippingDiscount.findById(discountId).lean();
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const [usages, total] = await Promise.all([
        free_shipping_discount_usage_model_1.FreeShippingDiscountUsage.find({ discountId: new mongoose_1.Types.ObjectId(discountId) })
            .sort({ usedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({
            path: 'customerId',
            select: 'firstName lastName email phoneNumber',
        })
            .populate({
            path: 'orderId',
            populate: [
                { path: 'shippingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
                { path: 'customerId', select: 'firstName lastName email' },
            ],
        })
            .lean(),
        free_shipping_discount_usage_model_1.FreeShippingDiscountUsage.countDocuments({ discountId: new mongoose_1.Types.ObjectId(discountId) }),
    ]);
    const data = usages
        .filter((u) => u.orderId)
        .map((u) => ({
        usage: {
            usedAt: u.usedAt,
        },
        customer: u.customerId
            ? {
                _id: u.customerId._id,
                firstName: u.customerId.firstName,
                lastName: u.customerId.lastName,
                email: u.customerId.email,
                phoneNumber: u.customerId.phoneNumber,
            }
            : null,
        order: u.orderId
            ? {
                _id: u.orderId._id,
                orderDate: u.orderId.orderDate,
                status: u.orderId.status,
                subtotal: u.orderId.subtotal,
                shippingCost: u.orderId.shippingCost,
                total: u.orderId.total,
                shippingAddress: u.orderId.shippingAddressId,
            }
            : null,
    }));
    res.status(200).json({
        success: true,
        data,
        discount: {
            _id: discount._id,
            title: discount.title,
            discountCode: discount.discountCode,
            method: discount.method,
        },
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
        },
    });
});
