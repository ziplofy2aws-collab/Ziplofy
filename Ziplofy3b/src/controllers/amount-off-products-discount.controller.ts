import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  AmountOffProductsCustomerEntry,
  AmountOffProductsCustomerSegmentEntry,
  AmountOffProductsDiscount,
  AmountOffProductsDiscountUsage,
  AmountOffProductsEntry,
} from '../models';

export class AmountOffProductsDiscountController {
  /**
   * Create a new amount off products discount
   */
  static async createDiscount(req: Request, res: Response) {
    try {
      const {
        // Store ID
        storeId,
        
        // Method
        method,
        discountCode,
        title,
        
        // Sales channel and usage limits
        allowDiscountOnChannels,
        limitTotalUses,
        totalUsesLimit,
        limitOneUsePerCustomer,
        
        // Discount value
        valueType,
        percentage,
        fixedAmount,
        
        // Applies to
        appliesTo,
        oncePerOrder,
        
        // Eligibility
        eligibility,
        applyOnPOSPro,
        
        // Minimum purchase requirements
        minimumPurchase,
        minimumAmount,
        minimumQuantity,
        
        // Combinations
        productDiscounts,
        orderDiscounts,
        shippingDiscounts,
        
        // Active dates
        startDate,
        startTime,
        setEndDate,
        endDate,
        endTime,
        
        // Status
        status = 'active',
        
        // Target products/collections
        targetProductIds = [],
        targetCollectionIds = [],
        
        // Target customers/customer segments (for eligibility)
        targetCustomerSegmentIds = [],
        targetCustomerIds = []
      } = req.body;

      if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required' });
      }

      // Create the main discount record
      const discountData = {
        storeId,
        method,
        ...(method === 'discount-code' && { discountCode }),
        ...(method === 'automatic' && { title }),
        allowDiscountOnChannels,
        limitTotalUses,
        totalUsesLimit,
        limitOneUsePerCustomer,
        valueType,
        ...(valueType === 'percentage' && { percentage }),
        ...(valueType === 'fixed-amount' && { fixedAmount }),
        appliesTo,
        oncePerOrder,
        eligibility,
        applyOnPOSPro,
        minimumPurchase,
        minimumAmount,
        minimumQuantity,
        productDiscounts,
        orderDiscounts,
        shippingDiscounts,
        startDate,
        startTime,
        setEndDate,
        endDate,
        endTime,
        status
      };

      const discount = new AmountOffProductsDiscount(discountData);
      await discount.save();

      // Create entry records for target products (only when appliesTo is specific-products)
      if (appliesTo === 'specific-products' && Array.isArray(targetProductIds) && targetProductIds.length > 0) {
        const productEntries = targetProductIds.map((productId: string) => ({
          storeId,
          discountId: discount._id,
          productId,
          collectionId: null
        }));
        await AmountOffProductsEntry.insertMany(productEntries);
      }

      // Create entry records for target collections (only when appliesTo is specific-collections)
      if (appliesTo === 'specific-collections' && Array.isArray(targetCollectionIds) && targetCollectionIds.length > 0) {
        const collectionEntries = targetCollectionIds.map((collectionId: string) => ({
          storeId,
          discountId: discount._id,
          productId: null,
          collectionId
        }));
        await AmountOffProductsEntry.insertMany(collectionEntries);
      }

      // Create customer segment entry records (only when eligibility is specific-customer-segments)
      if (eligibility === 'specific-customer-segments' && targetCustomerSegmentIds.length > 0) {
        const customerSegmentEntries = targetCustomerSegmentIds.map((customerSegmentId: string) => ({
          storeId,
          discountId: discount._id,
          customerSegmentId
        }));
        await AmountOffProductsCustomerSegmentEntry.insertMany(customerSegmentEntries);
      }

      // Create customer entry records (only when eligibility is specific-customers)
      if (eligibility === 'specific-customers' && targetCustomerIds.length > 0) {
        const customerEntries = targetCustomerIds.map((customerId: string) => ({
          storeId,
          discountId: discount._id,
          customerId
        }));
        await AmountOffProductsCustomerEntry.insertMany(customerEntries);
      }

      res.status(201).json({
        success: true,
        message: 'Amount off products discount created successfully',
        data: discount
      });

    } catch (error) {
      console.error('Error creating amount off products discount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create amount off products discount',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all amount off products discounts for a store
   */
  static async getDiscountsByStore(req: Request, res: Response) {
    try {
      const { id: storeId } = req.params;
      if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required' });
      }

      const { page = 1, limit = 10, status, method } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build filter object
      const filter: any = { storeId };
      if (status) filter.status = status;
      if (method) filter.method = method;

      // Get discounts with pagination
      const discounts = await AmountOffProductsDiscount.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      // Get total count for pagination
      const total = await AmountOffProductsDiscount.countDocuments(filter);

      // Get target products/collections and eligibility for each discount
      const discountsWithTargets = await Promise.all(
        discounts.map(async (discount) => {
          // Get product/collection entries
          const entries = await AmountOffProductsEntry.find({
            storeId,
            discountId: discount._id
          }).populate('productId', 'title price imageUrl').populate('collectionId', 'title description').lean();

          const targetProductIds = entries
            .filter((entry: { productId?: unknown }) => entry.productId)
            .map((entry: { productId?: unknown }) => entry.productId);

          const targetCollectionIds = entries
            .filter((entry: { collectionId?: unknown }) => entry.collectionId)
            .map((entry: { collectionId?: unknown }) => entry.collectionId);

          // Get eligibility entries (customer segments and specific customers)
          const [segmentEntries, customerEntries] = await Promise.all([
            AmountOffProductsCustomerSegmentEntry.find({ storeId, discountId: discount._id })
              .populate('customerSegmentId', 'name')
              .lean(),
            AmountOffProductsCustomerEntry.find({ storeId, discountId: discount._id })
              .populate('customerId', 'firstName lastName email')
              .lean()
          ]);

          const targetCustomerSegmentIds = segmentEntries
            .filter((entry: { customerSegmentId?: unknown }) => entry.customerSegmentId)
            .map((entry: { customerSegmentId: unknown }) => entry.customerSegmentId);

          const targetCustomerIds = customerEntries
            .filter((entry: { customerId?: unknown }) => entry.customerId)
            .map((entry: { customerId: unknown }) => entry.customerId);

          return {
            ...discount,
            targetProductIds,
            targetCollectionIds,
            targetCustomerSegmentIds,
            targetCustomerIds
          };
        })
      );

      res.json({
        success: true,
        data: discountsWithTargets,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      });

    } catch (error) {
      console.error('Error fetching amount off products discounts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch amount off products discounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a single amount off products discount by id (with targets and eligibility)
   */
  static async getDiscountById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Valid discount ID is required' });
      }

      const discount = await AmountOffProductsDiscount.findById(id).lean();
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      const storeId = discount.storeId.toString();

      const [entries, segmentEntries, customerEntries] = await Promise.all([
        AmountOffProductsEntry.find({ storeId, discountId: id })
          .populate('productId', 'title price imageUrl')
          .populate('collectionId', 'title description')
          .lean(),
        AmountOffProductsCustomerSegmentEntry.find({ storeId, discountId: id })
          .populate('customerSegmentId', 'name')
          .lean(),
        AmountOffProductsCustomerEntry.find({ storeId, discountId: id })
          .populate('customerId', 'firstName lastName email')
          .lean()
      ]);

      const targetProductIds = entries.filter((e: { productId?: unknown }) => e.productId).map((e: { productId?: unknown }) => e.productId);
      const targetCollectionIds = entries.filter((e: { collectionId?: unknown }) => e.collectionId).map((e: { collectionId?: unknown }) => e.collectionId);
      const targetCustomerSegmentIds = segmentEntries.filter((e: { customerSegmentId?: unknown }) => e.customerSegmentId).map((e: { customerSegmentId: unknown }) => e.customerSegmentId);
      const targetCustomerIds = customerEntries.filter((e: { customerId?: unknown }) => e.customerId).map((e: { customerId: unknown }) => e.customerId);

      res.json({
        success: true,
        data: {
          ...discount,
          targetProductIds,
          targetCollectionIds,
          targetCustomerSegmentIds,
          targetCustomerIds
        }
      });
    } catch (error) {
      console.error('Error fetching amount off products discount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch discount',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update an amount off products discount
   */
  static async updateDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Valid discount ID is required' });
      }

      const {
        method,
        discountCode,
        title,
        allowDiscountOnChannels,
        limitTotalUses,
        totalUsesLimit,
        limitOneUsePerCustomer,
        valueType,
        percentage,
        fixedAmount,
        appliesTo,
        oncePerOrder,
        eligibility,
        applyOnPOSPro,
        minimumPurchase,
        minimumAmount,
        minimumQuantity,
        productDiscounts,
        orderDiscounts,
        shippingDiscounts,
        startDate,
        startTime,
        setEndDate,
        endDate,
        endTime,
        status = 'active',
        targetProductIds = [],
        targetCollectionIds = [],
        targetCustomerSegmentIds = [],
        targetCustomerIds = []
      } = req.body;

      const discount = await AmountOffProductsDiscount.findById(id);
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      const storeId = discount.storeId.toString();

      discount.method = method ?? discount.method;
      if (method === 'discount-code') discount.discountCode = discountCode ?? discount.discountCode;
      if (method === 'automatic') discount.title = title ?? discount.title;
      discount.allowDiscountOnChannels = allowDiscountOnChannels ?? discount.allowDiscountOnChannels;
      discount.limitTotalUses = limitTotalUses ?? discount.limitTotalUses;
      discount.totalUsesLimit = totalUsesLimit ?? discount.totalUsesLimit;
      discount.limitOneUsePerCustomer = limitOneUsePerCustomer ?? discount.limitOneUsePerCustomer;
      discount.valueType = valueType ?? discount.valueType;
      if (valueType === 'percentage') discount.percentage = percentage ?? discount.percentage;
      if (valueType === 'fixed-amount') discount.fixedAmount = fixedAmount ?? discount.fixedAmount;
      discount.appliesTo = appliesTo ?? discount.appliesTo;
      discount.oncePerOrder = oncePerOrder ?? discount.oncePerOrder;
      discount.eligibility = eligibility ?? discount.eligibility;
      discount.applyOnPOSPro = applyOnPOSPro ?? discount.applyOnPOSPro;
      discount.minimumPurchase = minimumPurchase ?? discount.minimumPurchase;
      discount.minimumAmount = minimumAmount ?? discount.minimumAmount;
      discount.minimumQuantity = minimumQuantity ?? discount.minimumQuantity;
      discount.productDiscounts = productDiscounts ?? discount.productDiscounts;
      discount.orderDiscounts = orderDiscounts ?? discount.orderDiscounts;
      discount.shippingDiscounts = shippingDiscounts ?? discount.shippingDiscounts;
      discount.startDate = startDate ?? discount.startDate;
      discount.startTime = startTime ?? discount.startTime;
      discount.setEndDate = setEndDate ?? discount.setEndDate;
      discount.endDate = endDate ?? discount.endDate;
      discount.endTime = endTime ?? discount.endTime;
      discount.status = status ?? discount.status;

      await discount.save();

      await Promise.all([
        AmountOffProductsEntry.deleteMany({ storeId, discountId: id }),
        AmountOffProductsCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
        AmountOffProductsCustomerEntry.deleteMany({ storeId, discountId: id })
      ]);

      if (appliesTo === 'specific-products' && Array.isArray(targetProductIds) && targetProductIds.length > 0) {
        await AmountOffProductsEntry.insertMany(
          targetProductIds.map((productId: string) => ({
            storeId,
            discountId: id,
            productId,
            collectionId: null
          }))
        );
      }
      if (appliesTo === 'specific-collections' && Array.isArray(targetCollectionIds) && targetCollectionIds.length > 0) {
        await AmountOffProductsEntry.insertMany(
          targetCollectionIds.map((collectionId: string) => ({
            storeId,
            discountId: id,
            productId: null,
            collectionId
          }))
        );
      }
      if (eligibility === 'specific-customer-segments' && Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
        await AmountOffProductsCustomerSegmentEntry.insertMany(
          targetCustomerSegmentIds.map((customerSegmentId: string) => ({
            storeId,
            discountId: id,
            customerSegmentId
          }))
        );
      }
      if (eligibility === 'specific-customers' && Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
        await AmountOffProductsCustomerEntry.insertMany(
          targetCustomerIds.map((customerId: string) => ({
            storeId,
            discountId: id,
            customerId
          }))
        );
      }

      const updated = await AmountOffProductsDiscount.findById(id).lean();
      res.json({
        success: true,
        message: 'Amount off products discount updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating amount off products discount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update discount',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete an amount off products discount and its entries/eligibility records
   */
  static async deleteDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Valid discount ID is required' });
      }

      const discount = await AmountOffProductsDiscount.findById(id);
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      const storeId = discount.storeId.toString();

      await Promise.all([
        AmountOffProductsEntry.deleteMany({ storeId, discountId: id }),
        AmountOffProductsCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
        AmountOffProductsCustomerEntry.deleteMany({ storeId, discountId: id }),
        AmountOffProductsDiscountUsage.deleteMany({ storeId, discountId: id }),
      ]);
      await AmountOffProductsDiscount.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Amount off products discount deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting amount off products discount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete discount',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get orders where this amount off products discount was used.
   * Uses the AmountOffProductsDiscountUsage model and populates customer and order.
   */
  static async getOrdersByDiscount(req: Request, res: Response) {
    try {
      const { id: discountId } = req.params as { id: string };
      const { page = 1, limit = 20 } = req.query as { page?: string | number; limit?: string | number };

      if (!discountId || !mongoose.isValidObjectId(discountId)) {
        return res.status(400).json({ success: false, error: 'Valid discount ID is required' });
      }

      const discount = await AmountOffProductsDiscount.findById(discountId).lean();
      if (!discount) {
        return res.status(404).json({ success: false, error: 'Discount not found' });
      }

      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [usages, total] = await Promise.all([
        AmountOffProductsDiscountUsage.find({ discountId })
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
        AmountOffProductsDiscountUsage.countDocuments({ discountId }),
      ]);

      const data = usages
        .filter((u: any) => u.orderId)
        .map((u: any) => ({
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

      res.json({
        success: true,
        data,
        discount: {
          _id: discount._id,
          title: (discount as any).title,
          discountCode: (discount as any).discountCode,
          method: (discount as any).method,
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      });
    } catch (error) {
      console.error('Error fetching orders for amount off products discount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders for this discount',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
