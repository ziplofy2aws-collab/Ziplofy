import { Router } from 'express';
import {
  getOrderById,
  getOrdersByStoreId,
  verifyOrderPayment,
} from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

export const orderRouter = Router();
orderRouter.use(protect);

// GET /api/orders/store/:storeId - Get all orders by store ID
orderRouter.get('/store/:storeId', getOrdersByStoreId);

// PATCH /api/orders/:id/verify-payment - Verify a submitted manual-payment UTR
orderRouter.patch('/:id/verify-payment', verifyOrderPayment);

// GET /api/orders/:id - Get order by ID
orderRouter.get('/:id', getOrderById);

