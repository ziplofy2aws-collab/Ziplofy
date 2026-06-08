"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByBuyXGetYDiscount = exports.deleteBuyXGetYDiscount = exports.updateBuyXGetYDiscount = exports.getBuyXGetYDiscountById = exports.getBuyXGetYDiscountsByStore = exports.createBuyXGetYDiscount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const buy_x_get_y_discount_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model");
const buy_x_get_y_buys_product_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-product-entry.model");
const buy_x_get_y_buys_collection_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-collection-entry.model");
const buy_x_get_y_gets_product_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-product-entry.model");
const buy_x_get_y_gets_collection_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-collection-entry.model");
const buy_x_get_y_customer_segment_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-segment-entry.model");
const buy_x_get_y_customer_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-entry.model");
const buy_x_get_y_discount_usage_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model");
const error_utils_1 = require("../utils/error.utils");
exports.createBuyXGetYDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { 
    // Store
    storeId, 
    // Method
    method, discountCode, title, 
    // Sales channel
    allowDiscountOnChannels, 
    // Customer buys
    customerBuys, quantity, amount, anyItemsFrom, 
    // Customer gets
    customerGetsQuantity, customerGetsAnyItemsFrom, discountedValue, discountedAmount, discountedPercentage, setMaxUsersPerOrder, maxUsersPerOrder, 
    // Eligibility
    eligibility, applyOnPOSPro, 
    // Limits
    limitTotalUses, totalUsesLimit, limitOneUsePerCustomer, 
    // Combinations
    productDiscounts, orderDiscounts, shippingDiscounts, 
    // Dates
    startDate, startTime, setEndDate, endDate, endTime, status = 'active', 
    // Targets
    buysProductIds = [], buysCollectionIds = [], getsProductIds = [], getsCollectionIds = [], targetCustomerSegmentIds = [], targetCustomerIds = [], } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    // Create main discount
    const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.create({
        storeId,
        method,
        ...(method === 'discount-code' && { discountCode }),
        ...(method === 'automatic' && { title }),
        allowDiscountOnChannels,
        customerBuys,
        ...(customerBuys === 'minimum-quantity' && { quantity }),
        ...(customerBuys === 'minimum-amount' && { amount }),
        anyItemsFrom,
        customerGetsQuantity,
        customerGetsAnyItemsFrom,
        discountedValue,
        ...(discountedValue === 'amount' && { discountedAmount }),
        ...(discountedValue === 'percentage' && { discountedPercentage }),
        setMaxUsersPerOrder,
        maxUsersPerOrder,
        eligibility,
        applyOnPOSPro,
        limitTotalUses,
        totalUsesLimit,
        limitOneUsePerCustomer,
        productDiscounts,
        orderDiscounts,
        shippingDiscounts,
        startDate,
        startTime,
        setEndDate,
        endDate,
        endTime,
        status,
    });
    // Create buys entries based on anyItemsFrom selection
    if (anyItemsFrom === 'specific-products' && Array.isArray(buysProductIds) && buysProductIds.length > 0) {
        await buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.insertMany(buysProductIds.map((pid) => ({ storeId, discountId: discount._id, productId: pid })));
    }
    else if (anyItemsFrom === 'specific-collections' && Array.isArray(buysCollectionIds) && buysCollectionIds.length > 0) {
        await buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.insertMany(buysCollectionIds.map((cid) => ({ storeId, discountId: discount._id, collectionId: cid })));
    }
    // Create gets entries based on customerGetsAnyItemsFrom selection
    if (customerGetsAnyItemsFrom === 'specific-products' && Array.isArray(getsProductIds) && getsProductIds.length > 0) {
        await buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.insertMany(getsProductIds.map((pid) => ({
            storeId,
            discountId: discount._id,
            productId: pid,
            discountedValue,
            ...(discountedValue === 'amount' && { discountedAmount }),
            ...(discountedValue === 'percentage' && { discountedPercentage }),
            setMaxUsesPerOrder: setMaxUsersPerOrder,
            ...(setMaxUsersPerOrder && { maxUsesPerOrder: maxUsersPerOrder }),
        })));
    }
    else if (customerGetsAnyItemsFrom === 'specific-collections' && Array.isArray(getsCollectionIds) && getsCollectionIds.length > 0) {
        await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.insertMany(getsCollectionIds.map((cid) => ({
            storeId,
            discountId: discount._id,
            collectionId: cid,
            discountedValue,
            ...(discountedValue === 'amount' && { discountedAmount }),
            ...(discountedValue === 'percentage' && { discountedPercentage }),
            setMaxUsesPerOrder: setMaxUsersPerOrder,
            ...(setMaxUsersPerOrder && { maxUsesPerOrder: maxUsersPerOrder }),
        })));
    }
    // Create eligibility entries based on eligibility selection
    if (eligibility === 'specific-customer-segments' && Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
        await buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.insertMany(targetCustomerSegmentIds.map((sid) => ({ storeId, discountId: discount._id, customerSegmentId: sid })));
    }
    else if (eligibility === 'specific-customers' && Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
        await buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.insertMany(targetCustomerIds.map((cid) => ({ storeId, discountId: discount._id, customerId: cid })));
    }
    // Note: If eligibility === 'all-customers', no eligibility entries are created
    res.status(201).json({ success: true, message: 'Buy X Get Y discount created successfully', data: discount });
});
exports.getBuyXGetYDiscountsByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
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
        buy_x_get_y_discount_model_1.BuyXGetYDiscount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        buy_x_get_y_discount_model_1.BuyXGetYDiscount.countDocuments(filter),
    ]);
    const discountIds = discounts.map(d => d._id);
    const [buysProductEntries, buysCollectionEntries, getsProductEntries, getsCollectionEntries, customerSegmentEntries, customerEntries] = await Promise.all([
        buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.find({ storeId, discountId: { $in: discountIds } })
            .populate('productId', 'title sku imageUrls')
            .lean(),
        buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.find({ storeId, discountId: { $in: discountIds } })
            .populate('collectionId', 'title description')
            .lean(),
        buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.find({ storeId, discountId: { $in: discountIds } })
            .populate('productId', 'title sku imageUrls')
            .lean(),
        buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({ storeId, discountId: { $in: discountIds } })
            .populate('collectionId', 'title description')
            .lean(),
        buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.find({ storeId, discountId: { $in: discountIds } })
            .populate('customerSegmentId', 'name')
            .lean(),
        buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.find({ storeId, discountId: { $in: discountIds } })
            .populate('customerId', 'firstName lastName email')
            .lean(),
    ]);
    const byDiscount = (arr) => arr.reduce((m, e) => { var _a; (m[_a = e.discountId] || (m[_a] = [])).push(e); return m; }, {});
    const buysProductsBy = byDiscount(buysProductEntries);
    const buysCollectionsBy = byDiscount(buysCollectionEntries);
    const getsProductsBy = byDiscount(getsProductEntries);
    const getsCollectionsBy = byDiscount(getsCollectionEntries);
    const segmentsBy = byDiscount(customerSegmentEntries);
    const customersBy = byDiscount(customerEntries);
    const data = discounts.map(d => {
        const bid = String(d._id);
        const buysProductIds = (buysProductsBy[bid] || []).map((e) => e.productId);
        const buysCollectionIds = (buysCollectionsBy[bid] || []).map((e) => e.collectionId);
        const getsProductIds = (getsProductsBy[bid] || []).map((e) => e.productId);
        const getsCollectionIds = (getsCollectionsBy[bid] || []).map((e) => e.collectionId);
        const targetCustomerSegmentIds = (segmentsBy[bid] || []).map((e) => e.customerSegmentId);
        const targetCustomerIds = (customersBy[bid] || []).map((e) => e.customerId);
        return {
            ...d,
            buysProductIds,
            buysCollectionIds,
            getsProductIds,
            getsCollectionIds,
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
exports.getBuyXGetYDiscountById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findById(id).lean();
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const storeId = discount.storeId.toString();
    const [buysProductEntries, buysCollectionEntries, getsProductEntries, getsCollectionEntries, customerSegmentEntries, customerEntries] = await Promise.all([
        buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.find({ storeId, discountId: id })
            .populate('productId', 'title sku imageUrls')
            .lean(),
        buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.find({ storeId, discountId: id })
            .populate('collectionId', 'title description')
            .lean(),
        buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.find({ storeId, discountId: id })
            .populate('productId', 'title sku imageUrls')
            .lean(),
        buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({ storeId, discountId: id })
            .populate('collectionId', 'title description')
            .lean(),
        buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.find({ storeId, discountId: id })
            .populate('customerSegmentId', 'name')
            .lean(),
        buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.find({ storeId, discountId: id })
            .populate('customerId', 'firstName lastName email')
            .lean(),
    ]);
    const buysProductIds = buysProductEntries.map((e) => e.productId);
    const buysCollectionIds = buysCollectionEntries.map((e) => e.collectionId);
    const getsProductIds = getsProductEntries.map((e) => e.productId);
    const getsCollectionIds = getsCollectionEntries.map((e) => e.collectionId);
    const targetCustomerSegmentIds = customerSegmentEntries.map((e) => e.customerSegmentId);
    const targetCustomerIds = customerEntries.map((e) => e.customerId);
    res.status(200).json({
        success: true,
        data: {
            ...discount,
            buysProductIds,
            buysCollectionIds,
            getsProductIds,
            getsCollectionIds,
            targetCustomerSegmentIds,
            targetCustomerIds,
        },
    });
});
exports.updateBuyXGetYDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findById(id);
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const { method, discountCode, title, allowDiscountOnChannels, customerBuys, quantity, amount, anyItemsFrom, customerGetsQuantity, customerGetsAnyItemsFrom, discountedValue, discountedAmount, discountedPercentage, setMaxUsersPerOrder, maxUsersPerOrder, eligibility, applyOnPOSPro, limitTotalUses, totalUsesLimit, limitOneUsePerCustomer, productDiscounts, orderDiscounts, shippingDiscounts, startDate, startTime, setEndDate, endDate, endTime, status, buysProductIds = [], buysCollectionIds = [], getsProductIds = [], getsCollectionIds = [], targetCustomerSegmentIds = [], targetCustomerIds = [], } = req.body;
    const storeId = discount.storeId.toString();
    // Update main discount fields
    if (method !== undefined)
        discount.method = method;
    if (method === 'discount-code' && discountCode !== undefined)
        discount.discountCode = discountCode;
    if (method === 'automatic' && title !== undefined)
        discount.title = title;
    if (allowDiscountOnChannels !== undefined)
        discount.allowDiscountOnChannels = allowDiscountOnChannels;
    if (customerBuys !== undefined)
        discount.customerBuys = customerBuys;
    if (customerBuys === 'minimum-quantity' && quantity !== undefined)
        discount.quantity = quantity;
    if (customerBuys === 'minimum-amount' && amount !== undefined)
        discount.amount = amount;
    if (anyItemsFrom !== undefined)
        discount.anyItemsFrom = anyItemsFrom;
    if (customerGetsQuantity !== undefined)
        discount.customerGetsQuantity = customerGetsQuantity;
    if (customerGetsAnyItemsFrom !== undefined)
        discount.customerGetsAnyItemsFrom = customerGetsAnyItemsFrom;
    if (discountedValue !== undefined)
        discount.discountedValue = discountedValue;
    if (discountedValue === 'amount' && discountedAmount !== undefined)
        discount.discountedAmount = discountedAmount;
    if (discountedValue === 'percentage' && discountedPercentage !== undefined)
        discount.discountedPercentage = discountedPercentage;
    if (setMaxUsersPerOrder !== undefined)
        discount.setMaxUsersPerOrder = setMaxUsersPerOrder;
    if (maxUsersPerOrder !== undefined)
        discount.maxUsersPerOrder = maxUsersPerOrder;
    if (eligibility !== undefined)
        discount.eligibility = eligibility;
    if (applyOnPOSPro !== undefined)
        discount.applyOnPOSPro = applyOnPOSPro;
    if (limitTotalUses !== undefined)
        discount.limitTotalUses = limitTotalUses;
    if (totalUsesLimit !== undefined)
        discount.totalUsesLimit = totalUsesLimit;
    if (limitOneUsePerCustomer !== undefined)
        discount.limitOneUsePerCustomer = limitOneUsePerCustomer;
    if (productDiscounts !== undefined)
        discount.productDiscounts = productDiscounts;
    if (orderDiscounts !== undefined)
        discount.orderDiscounts = orderDiscounts;
    if (shippingDiscounts !== undefined)
        discount.shippingDiscounts = shippingDiscounts;
    if (startDate !== undefined)
        discount.startDate = startDate;
    if (startTime !== undefined)
        discount.startTime = startTime;
    if (setEndDate !== undefined)
        discount.setEndDate = setEndDate;
    if (endDate !== undefined)
        discount.endDate = endDate;
    if (endTime !== undefined)
        discount.endTime = endTime;
    if (status !== undefined)
        discount.status = status;
    await discount.save();
    // Get final discount values for gets entries
    const finalDiscountedValue = discount.discountedValue;
    const finalDiscountedAmount = discount.discountedAmount;
    const finalDiscountedPercentage = discount.discountedPercentage;
    const finalSetMaxUsesPerOrder = discount.setMaxUsersPerOrder;
    const finalMaxUsesPerOrder = discount.maxUsersPerOrder;
    // Delete all existing entries
    await Promise.all([
        buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.deleteMany({ storeId, discountId: id }),
    ]);
    // Get final values for conditional entry creation
    const finalAnyItemsFrom = discount.anyItemsFrom;
    const finalCustomerGetsAnyItemsFrom = discount.customerGetsAnyItemsFrom;
    const finalEligibility = discount.eligibility;
    // Re-create buys entries based on anyItemsFrom selection
    if (finalAnyItemsFrom === 'specific-products' && Array.isArray(buysProductIds) && buysProductIds.length > 0) {
        await buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.insertMany(buysProductIds.map((pid) => ({ storeId, discountId: id, productId: pid })));
    }
    else if (finalAnyItemsFrom === 'specific-collections' && Array.isArray(buysCollectionIds) && buysCollectionIds.length > 0) {
        await buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.insertMany(buysCollectionIds.map((cid) => ({ storeId, discountId: id, collectionId: cid })));
    }
    // Re-create gets entries based on customerGetsAnyItemsFrom selection
    if (finalCustomerGetsAnyItemsFrom === 'specific-products' && Array.isArray(getsProductIds) && getsProductIds.length > 0) {
        await buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.insertMany(getsProductIds.map((pid) => ({
            storeId,
            discountId: id,
            productId: pid,
            discountedValue: finalDiscountedValue,
            ...(finalDiscountedValue === 'amount' && { discountedAmount: finalDiscountedAmount }),
            ...(finalDiscountedValue === 'percentage' && { discountedPercentage: finalDiscountedPercentage }),
            setMaxUsesPerOrder: finalSetMaxUsesPerOrder,
            ...(finalSetMaxUsesPerOrder && { maxUsesPerOrder: finalMaxUsesPerOrder }),
        })));
    }
    else if (finalCustomerGetsAnyItemsFrom === 'specific-collections' && Array.isArray(getsCollectionIds) && getsCollectionIds.length > 0) {
        await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.insertMany(getsCollectionIds.map((cid) => ({
            storeId,
            discountId: id,
            collectionId: cid,
            discountedValue: finalDiscountedValue,
            ...(finalDiscountedValue === 'amount' && { discountedAmount: finalDiscountedAmount }),
            ...(finalDiscountedValue === 'percentage' && { discountedPercentage: finalDiscountedPercentage }),
            setMaxUsesPerOrder: finalSetMaxUsesPerOrder,
            ...(finalSetMaxUsesPerOrder && { maxUsesPerOrder: finalMaxUsesPerOrder }),
        })));
    }
    // Re-create eligibility entries based on eligibility selection
    if (finalEligibility === 'specific-customer-segments' && Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
        await buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.insertMany(targetCustomerSegmentIds.map((sid) => ({ storeId, discountId: id, customerSegmentId: sid })));
    }
    else if (finalEligibility === 'specific-customers' && Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
        await buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.insertMany(targetCustomerIds.map((cid) => ({ storeId, discountId: id, customerId: cid })));
    }
    // Note: If eligibility === 'all-customers', no eligibility entries are created
    const updated = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findById(id).lean();
    res.status(200).json({ success: true, message: 'Buy X Get Y discount updated successfully', data: updated });
});
exports.deleteBuyXGetYDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findById(id);
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const storeId = discount.storeId.toString();
    // Delete all related entries including usage records
    await Promise.all([
        buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.deleteMany({ storeId, discountId: id }),
        buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.deleteMany({ storeId, discountId: id }),
    ]);
    await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Buy X Get Y discount deleted successfully' });
});
/**
 * Get orders where this Buy X Get Y discount was used.
 * Uses the BuyXGetYDiscountUsage model and populates customer and order.
 */
exports.getOrdersByBuyXGetYDiscount = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id: discountId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    if (!discountId || !mongoose_1.default.isValidObjectId(discountId)) {
        throw new error_utils_1.CustomError('Valid discount ID is required', 400);
    }
    const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findById(discountId).lean();
    if (!discount) {
        throw new error_utils_1.CustomError('Discount not found', 404);
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const [usages, total] = await Promise.all([
        buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.find({ discountId })
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
        buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.countDocuments({ discountId }),
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
