import { Router } from 'express';
import {
  createBuyXGetYDiscount,
  getBuyXGetYDiscountsByStore,
  getBuyXGetYDiscountById,
  updateBuyXGetYDiscount,
  deleteBuyXGetYDiscount,
  getOrdersByBuyXGetYDiscount,
} from '../controllers/buy-x-get-y-discount.controller';
import { protect } from '../middlewares/auth.middleware';

export const buyXGetYDiscountRouter = Router();

buyXGetYDiscountRouter.use(protect);

// Create
buyXGetYDiscountRouter.post('/', createBuyXGetYDiscount);

// List by store (must be before /:id so "store" is not captured as id)
buyXGetYDiscountRouter.get('/store/:id', getBuyXGetYDiscountsByStore);

// Orders where this discount was used (must be before /:id)
buyXGetYDiscountRouter.get('/:id/orders', getOrdersByBuyXGetYDiscount);

// Get by id
buyXGetYDiscountRouter.get('/:id', getBuyXGetYDiscountById);

// Update
buyXGetYDiscountRouter.put('/:id', updateBuyXGetYDiscount);

// Delete
buyXGetYDiscountRouter.delete('/:id', deleteBuyXGetYDiscount);
