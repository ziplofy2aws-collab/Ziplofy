import { Router } from 'express';
import { createCartEntry, deleteCartEntry, updateCartEntry, getCustomerCartEntries, getStoreUserCarts } from '../controllers/cart.controller';
import { storefrontProtect } from '../middlewares/storefront-auth.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

export const cartRouter = Router();

// Admin route to get all user carts for a store (store owners only)
cartRouter.get('/store/:storeId', protect,getStoreUserCarts);

cartRouter.use(storefrontProtect);

// Create or set quantity for a cart entry
cartRouter.post('/', createCartEntry);

// Get all cart entries for a customer
cartRouter.get('/customer/:customerId', getCustomerCartEntries);

// Update quantity for a cart entry
cartRouter.patch('/:id', updateCartEntry);

// Delete a cart entry
cartRouter.delete('/:id', deleteCartEntry);



