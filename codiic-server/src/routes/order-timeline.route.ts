import express from 'express';
import {
  createOrderTimelineEntry,
  deleteOrderTimelineEntry,
  getOrderTimelineByOrderId,
  updateOrderTimelineEntry,
} from '../controllers/order-timeline.controller';
import { protect } from '../middlewares/auth.middleware';

export const orderTimelineRouter = express.Router();

orderTimelineRouter.use(protect);

orderTimelineRouter.post('/', createOrderTimelineEntry);
orderTimelineRouter.get('/order/:orderId', getOrderTimelineByOrderId);
orderTimelineRouter.put('/:id', updateOrderTimelineEntry);
orderTimelineRouter.delete('/:id', deleteOrderTimelineEntry);
