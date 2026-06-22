import { Router } from 'express';
import { createCartEntry, deleteCartEntry, updateCartEntry, getCustomerCartEntries, getStoreUserCarts } from '../controllers/cart.controller';
import { sendCartRecoveryEmail } from '../controllers/cart-recovery.controller';
import { storefrontProtect } from '../middlewares/storefront-auth.middleware';
import { protect, authorize } from '../middlewares/auth.middleware';

export const cartRouter = Router();

// Admin route to get all user carts for a store (store owners only)
cartRouter.get('/store/:storeId', protect,getStoreUserCarts);

// Admin: send abandoned cart recovery email (test recipient hardcoded for now)
cartRouter.post('/store/:storeId/recovery-email', protect, sendCartRecoveryEmail);

cartRouter.use(storefrontProtect);

// Create or set quantity for a cart entry
cartRouter.post('/', createCartEntry);

// Get all cart entries for a customer
cartRouter.get('/customer/:customerId', getCustomerCartEntries);

// Update quantity for a cart entry
cartRouter.patch('/:id', updateCartEntry);

// Delete a cart entry
cartRouter.delete('/:id', deleteCartEntry);



