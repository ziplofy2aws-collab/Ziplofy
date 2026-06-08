import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Country, CustomerSegmentEntry } from '../../models';
import { FreeShippingDiscount } from '../../models/discount/free-shipping-discount-model/free-shipping-discount.model';
import { FreeShippingCustomerSegmentEntry } from '../../models/discount/free-shipping-discount-model/free-shipping-customer-segment-entry.model';
import { FreeShippingCustomerEntry } from '../../models/discount/free-shipping-discount-model/free-shipping-customer-entry.model';
import { FreeShippingCountryEntry } from '../../models/discount/free-shipping-discount-model/free-shipping-country-entry.model';
import { FreeShippingDiscountUsage } from '../../models/discount/free-shipping-discount-model/free-shipping-discount-usage.model';
import { asyncErrorHandler, CustomError } from '../../utils/error.utils';

async function getShippingCountryIso2(addr?: { country?: string; countryId?: string }): Promise<string | null> {
  if (!addr) return null;
  if (addr.country && typeof addr.country === 'string' && addr.country.length === 2) {
    return addr.country.toUpperCase();
  }
  if (addr.countryId && mongoose.isValidObjectId(addr.countryId)) {
    const c = await Country.findById(addr.countryId).select('iso2').lean();
    return (c as any)?.iso2 ?? null;
  }
  return null;
}

export const checkEligibleFreeShippingDiscounts = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, customerId, cartItems, shippingAddress, currentShippingRate } = req.body as {
    storeId: string;
    customerId: string;
    cartItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: {
      country?: string;
      countryId?: string;
      state?: string;
      city?: string;
    };
    // TODO: right now we are sending a static shipping rate from the frontend, but later we need to send correct shipping rates according to the country i guess
    currentShippingRate?: number; // Current shipping rate in currency units
  };

  // Validate required fields
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (!customerId || !mongoose.isValidObjectId(customerId)) {
    throw new CustomError('Valid customerId is required', 400);
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new CustomError('Cart items are required', 400);
  }

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get only automatic free shipping discounts for the store
  const discounts = await FreeShippingDiscount.find({
    storeId,
    status: 'active',
    method: 'automatic',
  });

  const eligibleDiscounts = [];

  for (const discount of discounts) {
    let isEligible = false;

    // 1. ELIGIBILITY CHECK
    if (discount.eligibility === 'all-customers') {
      isEligible = true;
    } 
    else if (discount.eligibility === 'specific-customer-segments') {
      const eligibleSegments = await FreeShippingCustomerSegmentEntry.find({
        storeId,
        discountId: discount._id,
      }).select('customerSegmentId');
      
      if (eligibleSegments.length > 0) {
        // Get customer's segments by finding which segments contain this customer
        const customerSegmentEntries = await CustomerSegmentEntry.find({
          customerId: customerId
        }).select('segmentId');
        
        // Check if customer belongs to any eligible segment
        const customerSegmentIds = customerSegmentEntries.map(entry => entry.segmentId.toString());
        const eligibleSegmentIds = eligibleSegments
          .map(entry => entry.customerSegmentId?.toString())
          .filter(Boolean) as string[];
        
        // Check if there's any overlap between customer segments and eligible segments
        const hasMatchingSegment = customerSegmentIds.some(customerSegmentId => 
          eligibleSegmentIds.includes(customerSegmentId)
        );
        
        if (hasMatchingSegment) {
          isEligible = true;
        }
      }
    }
    else if (discount.eligibility === 'specific-customers') {
      const customerEntry = await FreeShippingCustomerEntry.findOne({
        storeId,
        discountId: discount._id,
        customerId,
      });
      if (customerEntry) {
        isEligible = true;
      }
    }

    if (!isEligible) continue;

    // 2. COUNTRY ELIGIBILITY CHECK
    if (discount.countrySelection === 'selected-countries') {
      const countryEntries = await FreeShippingCountryEntry.find({ storeId, discountId: discount._id })
        .populate('countryId', 'iso2')
        .lean();
      const eligibleCountryIso2s = countryEntries
        .map((e: any) => e.countryId?.iso2)
        .filter(Boolean);
      if (eligibleCountryIso2s.length > 0) {
        const countryIso2 = await getShippingCountryIso2(shippingAddress);
        if (!countryIso2) continue;
        const isCountryEligible = eligibleCountryIso2s.includes(countryIso2);
        if (!isCountryEligible) continue;
      }
    }

    // 3. MINIMUM PURCHASE REQUIREMENTS CHECK
    if (discount.minimumPurchase === 'minimum-amount' && discount.minimumAmount) {
      if (cartTotal < discount.minimumAmount) continue;
    }

    if (discount.minimumPurchase === 'minimum-quantity' && discount.minimumQuantity) {
      if (totalQuantity < discount.minimumQuantity) continue;
    }

    // 4. DATE VALIDATION (if dates are set)
    const now = new Date();
    if (discount.startDate) {
      const startDateTime = new Date(`${discount.startDate}T${discount.startTime || '00:00'}`);
      if (now < startDateTime) continue;
    }
    if (discount.setEndDate && discount.endDate) {
      const endDateTime = new Date(`${discount.endDate}T${discount.endTime || '23:59'}`);
      if (now > endDateTime) continue;
    }

    // 5. SHIPPING RATE VALIDATION (if excludeShippingRates is enabled)
    if (discount.excludeShippingRates && discount.shippingRateLimit !== undefined && discount.shippingRateLimit !== null) {
      if (currentShippingRate === undefined || currentShippingRate === null) {
        continue; // No shipping rate provided, skip
      }
      
      // If current shipping rate exceeds the limit, this discount doesn't apply
      if (currentShippingRate > discount.shippingRateLimit) {
        continue;
      }
    }

    // Add to eligible discounts
    eligibleDiscounts.push({
      id: discount._id,
      method: discount.method,
      discountCode: discount.discountCode,
      title: discount.title,
      message: 'You are eligible for free shipping!',
      countrySelection: discount.countrySelection,
      excludeShippingRates: discount.excludeShippingRates,
      shippingRateLimit: discount.shippingRateLimit,
      combinations: {
        productDiscounts: !!discount.productDiscounts,
        orderDiscounts: !!discount.orderDiscounts,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      eligibleDiscounts,
      cartTotal,
      totalQuantity,
      shippingAddress,
      currentShippingRate,
    },
    message: `Found ${eligibleDiscounts.length} eligible free shipping discount(s)`,
  });
});

export const validateFreeShippingDiscountCode = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, customerId, cartItems, discountCode, shippingAddress, currentShippingRate } = req.body as {
    storeId: string;
    customerId: string;
    cartItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    discountCode: string;
    shippingAddress?: {
      country?: string;
      countryId?: string;
      state?: string;
      city?: string;
    };
    currentShippingRate?: number; // Current shipping rate in currency units
  };

  // Validate required fields
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (!customerId || !mongoose.isValidObjectId(customerId)) {
    throw new CustomError('Valid customerId is required', 400);
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new CustomError('Cart items are required', 400);
  }
  if (!discountCode || !discountCode.trim()) {
    throw new CustomError('Discount code is required', 400);
  }

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Find discount by code
  const discount = await FreeShippingDiscount.findOne({
    storeId,
    status: 'active',
    method: 'discount-code',
    discountCode: discountCode.trim(),
  });

  if (!discount) {
    return res.status(400).json({
      success: false,
      message: 'Invalid discount code',
    });
  }

  // 1. ELIGIBILITY CHECK
  let isEligible = false;

  if (discount.eligibility === 'all-customers') {
    isEligible = true;
  } 
  else if (discount.eligibility === 'specific-customer-segments') {
    const eligibleSegments = await FreeShippingCustomerSegmentEntry.find({
      storeId,
      discountId: discount._id,
    }).select('customerSegmentId');
    
    if (eligibleSegments.length > 0) {
      const customerSegmentEntries = await CustomerSegmentEntry.find({
        customerId: customerId
      }).select('segmentId');
      
      const customerSegmentIds = customerSegmentEntries.map(entry => entry.segmentId.toString());
      const eligibleSegmentIds = eligibleSegments
        .filter(entry => entry.customerSegmentId)
        .map(entry => entry.customerSegmentId!.toString());
      
      const hasMatchingSegment = customerSegmentIds.some(customerSegmentId => 
        eligibleSegmentIds.includes(customerSegmentId)
      );
      
      if (hasMatchingSegment) {
        isEligible = true;
      }
    }
  }
  else if (discount.eligibility === 'specific-customers') {
    const customerEntry = await FreeShippingCustomerEntry.findOne({
      storeId,
      discountId: discount._id,
      customerId,
    });
    if (customerEntry) {
      isEligible = true;
    }
  }

  if (!isEligible) {
    return res.status(400).json({
      success: false,
      message: 'You are not eligible for this discount code',
    });
  }

  // 2. COUNTRY ELIGIBILITY CHECK
  if (discount.countrySelection === 'selected-countries') {
    const countryEntries = await FreeShippingCountryEntry.find({ storeId, discountId: discount._id })
      .populate('countryId', 'iso2')
      .lean();
    const eligibleCountryIso2s = countryEntries.map((e: any) => e.countryId?.iso2).filter(Boolean);
    if (eligibleCountryIso2s.length > 0) {
      const countryIso2 = await getShippingCountryIso2(shippingAddress);
      if (!countryIso2) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address with country is required for this discount',
        });
      }
      const isCountryEligible = eligibleCountryIso2s.includes(countryIso2);
      if (!isCountryEligible) {
        return res.status(400).json({
          success: false,
          message: 'This discount is not available in your country',
        });
      }
    }
  }

  // 3. MINIMUM PURCHASE REQUIREMENTS CHECK
  if (discount.minimumPurchase === 'minimum-amount' && discount.minimumAmount) {
    if (cartTotal < discount.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of ₹${discount.minimumAmount} required`,
      });
    }
  }

  if (discount.minimumPurchase === 'minimum-quantity' && discount.minimumQuantity) {
    if (totalQuantity < discount.minimumQuantity) {
      return res.status(400).json({
        success: false,
        message: `Minimum quantity of ${discount.minimumQuantity} items required`,
      });
    }
  }

  // 4. DATE VALIDATION (if dates are set)
  const now = new Date();
  if (discount.startDate) {
    const startDateTime = new Date(`${discount.startDate}T${discount.startTime || '00:00'}`);
    if (now < startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'This discount code is not yet active',
      });
    }
  }
  if (discount.setEndDate && discount.endDate) {
    const endDateTime = new Date(`${discount.endDate}T${discount.endTime || '23:59'}`);
    if (now > endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has expired',
      });
    }
  }

  // 5. SHIPPING RATE VALIDATION (if excludeShippingRates is enabled)
  if (discount.excludeShippingRates && discount.shippingRateLimit !== undefined && discount.shippingRateLimit !== null) {
    if (currentShippingRate === undefined || currentShippingRate === null) {
      return res.status(400).json({
        success: false,
        message: 'Shipping rate is required for this discount',
      });
    }
    
    // If current shipping rate exceeds the limit, this discount doesn't apply
    if (currentShippingRate > discount.shippingRateLimit) {
      return res.status(400).json({
        success: false,
        message: `This discount is not available for shipping rates over ₹${discount.shippingRateLimit}`,
      });
    }
  }

  // 6. USAGE LIMITS CHECK
  if (discount.limitTotalUses && discount.totalUsesLimit) {
    const totalUses = await FreeShippingDiscountUsage.countDocuments({
      discountId: discount._id,
    });
    
    if (totalUses >= discount.totalUsesLimit) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has reached its usage limit',
      });
    }
  }

  if (discount.limitOneUsePerCustomer) {
    const alreadyUsed = await FreeShippingDiscountUsage.findOne({
      discountId: discount._id,
      customerId,
    });
    
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this discount code',
      });
    }
  }

  // Return valid discount
  res.status(200).json({
    success: true,
    data: {
      discount: {
        id: discount._id,
        method: discount.method,
        discountCode: discount.discountCode,
        title: discount.title,
        message: 'Free shipping discount code applied!',
        countrySelection: discount.countrySelection,
        excludeShippingRates: discount.excludeShippingRates,
        shippingRateLimit: discount.shippingRateLimit,
        combinations: {
          productDiscounts: !!discount.productDiscounts,
          orderDiscounts: !!discount.orderDiscounts,
        },
      },
      cartTotal,
      totalQuantity,
      shippingAddress,
      currentShippingRate,
    },
    message: 'Free shipping discount code is valid',
  });
});
