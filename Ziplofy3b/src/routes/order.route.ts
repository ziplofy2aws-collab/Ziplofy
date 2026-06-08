import { Router } from 'express';
import { getOrderById, getOrdersByStoreId } from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

export const orderRouter = Router();
orderRouter.use(protect);

// GET /api/orders/store/:storeId - Get all orders by store ID
orderRouter.get('/store/:storeId', getOrdersByStoreId);

// GET /api/orders/:id - Get order by ID
orderRouter.get('/:id', getOrderById);

