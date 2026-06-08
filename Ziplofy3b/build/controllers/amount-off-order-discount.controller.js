"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByAmountOffOrderDiscount = exports.deleteAmountOffOrderDiscount = exports.updateAmountOffOrderDiscount = exports.getAmountOffOrderDiscountById = exports.getAmountOffOrderDiscountsByStore = exports.createAmountOffOrderDiscount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const amount_off_order_discount_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-discount.model");
const amount_off_order_customer_segment_entry_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-customer-segment-entry.model");
const amount_off_order_customer_entry_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-customer-entry.model");
const amount_off_order_discount_usage_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-discount-usage.model");
const error_utils_1 = require("../utils/error.utils");
exports.createAmountOffOrderDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, method, discountCode, title, valueType, percentage, fixedAmount, eligibility, applyOnPOSPro, minimumPurchase, minimumAmount, minimumQuantity, productDiscounts, orderDiscounts, shippingDiscounts, allowDiscountOnChannels, limitTotalUses, totalUsesLimit, limitOneUsePerCustomer, startDate, startTime, setEndDate, endDate, endTime, status = 'active', 
    // eligibility targets
    targetCustomerSegmentIds = [], targetCustomerIds = [], } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.create({
        storeId,
        method,
        ...(method === 'discount-code' && { discountCode }),
        ...(method === 'automatic' && { title }),
        valueType,
        ...(valueType === 'percentage' && { percentage }),
        ...(valueType === 'fixed-amount' && { fixedAmount }),
        eligibility,
        applyOnPOSPro,
        minimumPurchase,
        minimumAmount,
        minimumQuantity,
        productDiscounts,
        orderDiscounts,
        shippingDiscounts,
        allowDiscountOnChannels,
        limitTotalUses,
        totalUsesLimit,
        limitOneUsePerCustomer,
        startDate,
        startTime,
        setEndDate,
        endDate,
        endTime,
        status,
    });
    if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
        await amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.insertMany(targetCustomerSegmentIds.map((sid) => ({ storeId, discountId: discount._id, customerSegmentId: sid })));
    }
    if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
        await amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.insertMany(targetCustomerIds.map((cid) => ({ storeId, discountId: discount._id, customerId: cid })));
    }
    res.status(201).json({ success: true, message: 'Amount off order discount created successfully', data: discount });
});
exports.getAmountOffOrderDiscountsByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
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
        amount_off_order_discount_model_1.AmountOffOrderDiscount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        amount_off_order_discount_model_1.AmountOffOrderDiscount.countDocuments(filter),
    ]);
    const discountIds = discounts.map(d => d._id);
    const [segmentEntries, customerEntries] = await Promise.all([
        amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerSegmentId', 'name').lean(),
        amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerId', 'firstName lastName email').lean(),
    ]);
    const segmentsBy = segmentEntries.reduce((m, e) => { var _a; (m[_a = String(e.discountId)] || (m[_a] = [])).push(e); return m; }, {});
    const customersBy = customerEntries.reduce((m, e) => { var _a; (m[_a = String(e.discountId)] || (m[_a] = [])).push(e); return m; }, {});
    const data = discounts.map(d => {
        const targetCustomerSegmentIds = (segmentsBy[String(d._id)] || []).map((e) => e.customerSegmentId);
        const targetCustomerIds = (customersBy[String(d._id)] || []).map((e) => e.customerId);
        return {
            ...d,
            targetCustomerSegmentIds,
            targetCustomerIds,
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
exports.getAmountOffOrderDiscountById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.findById(id).lean();
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const storeId = discount.storeId.toString();
    const [segmentEntries, customerEntries] = await Promise.all([
        amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.find({ storeId, discountId: id }).populate('customerSegmentId', 'name').lean(),
        amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.find({ storeId, discountId: id }).populate('customerId', 'firstName lastName email').lean(),
    ]);
    const targetCustomerSegmentIds = segmentEntries.map((e) => e.customerSegmentId);
    const targetCustomerIds = customerEntries.map((e) => e.customerId);
    res.status(200).json({
        success: true,
        data: {
            ...discount,
            targetCustomerSegmentIds,
            targetCustomerIds,
        },
    });
});
exports.updateAmountOffOrderDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.findById(id);
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const { method, discountCode, title, valueType, percentage, fixedAmount, eligibility, applyOnPOSPro, minimumPurchase, minimumAmount, minimumQuantity, productDiscounts, orderDiscounts, shippingDiscounts, allowDiscountOnChannels, limitTotalUses, totalUsesLimit, limitOneUsePerCustomer, startDate, startTime, setEndDate, endDate, endTime, status = 'active', targetCustomerSegmentIds = [], targetCustomerIds = [], } = req.body;
    const storeId = discount.storeId.toString();
    discount.method = method ?? discount.method;
    if (method === 'discount-code')
        discount.discountCode = discountCode ?? discount.discountCode;
    if (method === 'automatic')
        discount.title = title ?? discount.title;
    discount.valueType = valueType ?? discount.valueType;
    if (valueType === 'percentage')
        discount.percentage = percentage ?? discount.percentage;
    if (valueType === 'fixed-amount')
        discount.fixedAmount = fixedAmount ?? discount.fixedAmount;
    discount.eligibility = eligibility ?? discount.eligibility;
    discount.applyOnPOSPro = applyOnPOSPro ?? discount.applyOnPOSPro;
    discount.minimumPurchase = minimumPurchase ?? discount.minimumPurchase;
    discount.minimumAmount = minimumAmount ?? discount.minimumAmount;
    discount.minimumQuantity = minimumQuantity ?? discount.minimumQuantity;
    discount.productDiscounts = productDiscounts ?? discount.productDiscounts;
    discount.orderDiscounts = orderDiscounts ?? discount.orderDiscounts;
    discount.shippingDiscounts = shippingDiscounts ?? discount.shippingDiscounts;
    discount.allowDiscountOnChannels = allowDiscountOnChannels ?? discount.allowDiscountOnChannels;
    discount.limitTotalUses = limitTotalUses ?? discount.limitTotalUses;
    discount.totalUsesLimit = totalUsesLimit ?? discount.totalUsesLimit;
    discount.limitOneUsePerCustomer = limitOneUsePerCustomer ?? discount.limitOneUsePerCustomer;
    discount.startDate = startDate ?? discount.startDate;
    discount.startTime = startTime ?? discount.startTime;
    discount.setEndDate = setEndDate ?? discount.setEndDate;
    discount.endDate = endDate ?? discount.endDate;
    discount.endTime = endTime ?? discount.endTime;
    discount.status = status ?? discount.status;
    await discount.save();
    await Promise.all([
        amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
        amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.deleteMany({ storeId, discountId: id }),
    ]);
    if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
        await amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.insertMany(targetCustomerSegmentIds.map((sid) => ({ storeId, discountId: id, customerSegmentId: sid })));
    }
    if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
        await amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.insertMany(targetCustomerIds.map((cid) => ({ storeId, discountId: id, customerId: cid })));
    }
    const updated = await amount_off_order_discount_model_1.AmountOffOrderDiscount.findById(id).lean();
    res.status(200).json({ success: true, message: 'Amount off order discount updated successfully', data: updated });
});
exports.deleteAmountOffOrderDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.findById(id);
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const storeId = discount.storeId.toString();
    await Promise.all([
        amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
        amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.deleteMany({ storeId, discountId: id }),
        amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.deleteMany({ storeId, discountId: id }),
    ]);
    await amount_off_order_discount_model_1.AmountOffOrderDiscount.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Amount off order discount deleted successfully' });
});
/**
 * Get orders where this amount-off-order discount was used.
 * Uses the AmountOffOrderDiscountUsage model and populates customer and order.
 */
exports.getOrdersByAmountOffOrderDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id: discountId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    if (!discountId || !mongoose_1.default.isValidObjectId(discountId)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.findById(discountId).lean();
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const [usages, total] = await Promise.all([
        amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.find({ discountId })
            .sort({ usedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber' })
            .populate({
            path: 'orderId',
            populate: [
                { path: 'shippingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
                { path: 'customerId', select: 'firstName lastName email' },
            ],
        })
            .lean(),
        amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.countDocuments({ discountId }),
    ]);
    const data = usages
        .filter((u) => u.orderId)
        .map((u) => ({
        usage: { usedAt: u.usedAt },
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
