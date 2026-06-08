import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { Cart, AutomationFlow } from '../models';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { TriggerKey } from '../models/automation/automation-flow.model';
import { ActionType } from '../models/action/action.model';
import { enqueueEmailAddress } from '../services/bull-mq/queues/email.queue';



export const createCartEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.storefrontUser;
  if (!user) throw new CustomError('Unauthorized', 401);

  const { storeId, productVariantId, quantity =0 } = req.body as {
    storeId: string;
    productVariantId: string;
    quantity?: number;
  };

  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) throw new CustomError('Valid storeId is required', 400);
  
  // Check if an active automation exists for this store with trigger ADD_TO_CART
  const automationExists = await AutomationFlow.findOne({
    storeId: String(storeId),
    triggerKey: TriggerKey.ADD_TO_CART,
    isActive: true,
  });

  if (automationExists) {
    const conditions = automationExists.flowData?.mainData?.conditions || [];
    if (conditions.length > 0) {
      console.log('it is having conditions');
      const firstCondition = conditions[0];
      if (firstCondition?.variable === 'cart.quantity' && firstCondition?.operator === 'greater_than_or_equal') {
        const value = Number(firstCondition.value);
        if (quantity >= value) {
          console.log('the quantity is greater than or equal to the value');
          if (automationExists.flowData?.mainData?.action?.actionType === ActionType.SEND_EMAIL) {
            const to = user.email
            if (to) {
              await enqueueEmailAddress(
                to,
                'Ziplofy: Cart threshold reached',
                `<p>Hi, you added ${quantity} item(s) to cart.</p>`
              );
            }
          }
        } else {
          console.log('the quantity is less than the value');
        }
      }
    } else {
      if (automationExists.flowData?.mainData?.action?.actionType === ActionType.SEND_EMAIL) {
        const to = (user as any)?.email;
        if (to) {
          await enqueueEmailAddress(
            to,
            'Ziplofy: Item added to cart',
            `<p>Hi, you added an item to your cart.</p>`
          );
        }
      }
    }
  } else {
    console.log('it is not having automation');
  }
  
  if (!productVariantId || !mongoose.Types.ObjectId.isValid(productVariantId)) throw new CustomError('Valid productVariantId is required', 400);
  const qty = Number(quantity ?? 1);
  if (!Number.isFinite(qty) || qty < 1) throw new CustomError('quantity must be >= 1', 400);
  const doc = await Cart.findOneAndUpdate(
    { customerId: new Types.ObjectId(user._id), productVariantId: new Types.ObjectId(productVariantId) },
    { $set: { storeId: new Types.ObjectId(storeId), quantity: qty } },
    { new: true, upsert: true }
  );

  if (doc) {
    await doc.populate({
      path: 'productVariantId',
      select: {
        cost: 0,
        profit: 0,
        marginPercent: 0,
        unitPriceTotalAmount: 0,
        unitPriceTotalAmountMetric: 0,
        unitPriceBaseMeasure: 0,
        unitPriceBaseMeasureMetric: 0,
        hsCode: 0,
        isInventoryTrackingEnabled: 0,
      },
    });
  }
  res.status(201).json({ success: true, data: doc });
});

export const updateCartEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.storefrontUser;
  if (!user) throw new CustomError('Unauthorized', 401);
  const { id } = req.params;
  const { quantity } = req.body as { quantity?: number };

  if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError('Valid cart id is required', 400);
  const qty = Number(quantity ?? 1);
  if (!Number.isFinite(qty) || qty < 1) throw new CustomError('quantity must be >= 1', 400);

  const updated = await Cart.findOneAndUpdate(
    { _id: new Types.ObjectId(id), customerId: new Types.ObjectId(user._id) },
    { $set: { quantity: qty } },
    { new: true }
  );

  if (!updated) throw new CustomError('Cart entry not found', 404);
  await updated.populate({
    path: 'productVariantId',
    select: {
      cost: 0,
      profit: 0,
      marginPercent: 0,
      unitPriceTotalAmount: 0,
      unitPriceTotalAmountMetric: 0,
      unitPriceBaseMeasure: 0,
      unitPriceBaseMeasureMetric: 0,
      hsCode: 0,
      isInventoryTrackingEnabled: 0,
    },
  });
  res.status(200).json({ success: true, data: updated });
});

export const deleteCartEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.storefrontUser;
  if (!user) throw new CustomError('Unauthorized', 401);
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError('Valid cart id is required', 400);

  const deleted = await Cart.findOneAndDelete({ _id: new Types.ObjectId(id), customerId: new Types.ObjectId(user._id) });
  if (!deleted) throw new CustomError('Cart entry not found', 404);

  res.status(200).json({ success: true, data: deleted });
});

export const getCustomerCartEntries = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.storefrontUser;
  if (!user) throw new CustomError('Unauthorized', 401);
  const { customerId } = req.params as { customerId: string };
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) throw new CustomError('Valid customerId is required', 400);
  if (String(user._id) !== String(customerId)) throw new CustomError('Forbidden', 403);

  const items = await Cart.find({ customerId: new Types.ObjectId(customerId) })
    .populate({
      path: 'productVariantId',
      select: {
        cost: 0,
        profit: 0,
        marginPercent: 0,
        unitPriceTotalAmount: 0,
        unitPriceTotalAmountMetric: 0,
        unitPriceBaseMeasure: 0,
        unitPriceBaseMeasureMetric: 0,
        hsCode: 0,
        isInventoryTrackingEnabled: 0,
      },
    })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, data: items, count: items.length });
});

export const getStoreUserCarts = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new CustomError('Unauthorized', 401);

  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  // Get all cart entries for this store
  const cartEntries = await Cart.find({ storeId: new Types.ObjectId(storeId) })
    .populate({
      path: 'customerId',
      select: 'firstName lastName email phoneNumber',
    })
    .populate({
      path: 'productVariantId',
      select: {
        cost: 0,
        profit: 0,
        marginPercent: 0,
        unitPriceTotalAmount: 0,
        unitPriceTotalAmountMetric: 0,
        unitPriceBaseMeasure: 0,
        unitPriceBaseMeasureMetric: 0,
        hsCode: 0,
        isInventoryTrackingEnabled: 0,
      },
    })
    .sort({ customerId: 1, createdAt: -1 })
    .lean();

  // Group cart entries by customer
  const customerCarts: { [customerId: string]: any } = {};
  
  cartEntries.forEach((entry: any) => {
    const customerId = entry.customerId._id.toString();
    
    if (!customerCarts[customerId]) {
      customerCarts[customerId] = {
        customer: {
          _id: entry.customerId._id,
          firstName: entry.customerId.firstName,
          lastName: entry.customerId.lastName,
          email: entry.customerId.email,
          phoneNumber: entry.customerId.phoneNumber,
        },
        cartItems: [],
        totalItems: 0,
        lastUpdated: entry.updatedAt,
      };
    }
    
    customerCarts[customerId].cartItems.push({
      _id: entry._id,
      productVariant: entry.productVariantId,
      quantity: entry.quantity,
      addedAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
    
    customerCarts[customerId].totalItems += entry.quantity;
    
    // Update last updated time if this entry is newer
    if (new Date(entry.updatedAt) > new Date(customerCarts[customerId].lastUpdated)) {
      customerCarts[customerId].lastUpdated = entry.updatedAt;
    }
  });

  // Convert to array and sort by last updated
  const result = Object.values(customerCarts).sort((a: any, b: any) => 
    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  res.status(200).json({ 
    success: true, 
    data: result, 
    count: result.length,
    storeId: storeId 
  });
});


