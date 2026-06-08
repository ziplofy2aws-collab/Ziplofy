import { Router } from 'express';
import { createOrder, getOrdersByCustomerId } from '../../controllers/storefront/order.controller';
import { storefrontProtect } from '../../middlewares/storefront-auth.middleware';

export const storefrontOrderRouter = Router();

storefrontOrderRouter.use(storefrontProtect);

// Create a new order
storefrontOrderRouter.post('/', createOrder);

// Get all orders for a customer
storefrontOrderRouter.get('/customer/:customerId', getOrdersByCustomerId);

