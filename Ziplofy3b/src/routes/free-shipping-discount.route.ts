import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  createFreeShippingDiscount,
  getFreeShippingDiscountsByStore,
  getFreeShippingDiscountById,
  getOrdersByFreeShippingDiscount,
  updateFreeShippingDiscount,
  deleteFreeShippingDiscount,
} from '../controllers/free-shipping-discount.controller';

export const freeShippingDiscountRouter = Router();

freeShippingDiscountRouter.use(protect);

// Create
freeShippingDiscountRouter.post('/', createFreeShippingDiscount);

// List by store
freeShippingDiscountRouter.get('/store/:id', getFreeShippingDiscountsByStore);

// Get orders where this discount was used (must be before /:id)
freeShippingDiscountRouter.get('/:id/orders', getOrdersByFreeShippingDiscount);

// Get by id (for edit)
freeShippingDiscountRouter.get('/:id', getFreeShippingDiscountById);

// Update
freeShippingDiscountRouter.put('/:id', updateFreeShippingDiscount);

// Delete
freeShippingDiscountRouter.delete('/:id', deleteFreeShippingDiscount);
