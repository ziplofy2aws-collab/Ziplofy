import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  createAmountOffOrderDiscount,
  getAmountOffOrderDiscountsByStore,
  getAmountOffOrderDiscountById,
  getOrdersByAmountOffOrderDiscount,
  updateAmountOffOrderDiscount,
  deleteAmountOffOrderDiscount,
} from '../controllers/amount-off-order-discount.controller';

export const amountOffOrderDiscountRouter = Router();

amountOffOrderDiscountRouter.use(protect);

// Create
amountOffOrderDiscountRouter.post('/', createAmountOffOrderDiscount);

// List by store
amountOffOrderDiscountRouter.get('/store/:id', getAmountOffOrderDiscountsByStore);

// Get orders where this discount was used (must be before /:id)
amountOffOrderDiscountRouter.get('/:id/orders', getOrdersByAmountOffOrderDiscount);

// Get by id (for edit)
amountOffOrderDiscountRouter.get('/:id', getAmountOffOrderDiscountById);

// Update
amountOffOrderDiscountRouter.put('/:id', updateAmountOffOrderDiscount);

// Delete
amountOffOrderDiscountRouter.delete('/:id', deleteAmountOffOrderDiscount);
