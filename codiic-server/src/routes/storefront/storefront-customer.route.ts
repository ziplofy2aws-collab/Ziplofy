import { Router } from 'express';
import { updateCustomer } from '../../controllers/storefront/storefront-customer.controller';
import { storefrontProtect } from '../../middlewares/storefront-auth.middleware';

export const storefrontCustomerRouter = Router();

storefrontCustomerRouter.use(storefrontProtect);

// Update customer profile (storefront)
storefrontCustomerRouter.patch('/:customerId', updateCustomer);
