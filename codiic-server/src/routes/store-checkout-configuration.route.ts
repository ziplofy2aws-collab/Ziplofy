import { Router } from 'express';
import {
  createStoreCheckoutConfiguration,
  deleteStoreCheckoutConfiguration,
  getStoreCheckoutConfigurationById,
  getStoreCheckoutConfigurationByStoreId,
  updateStoreCheckoutConfiguration,
} from '../controllers/store-checkout-configuration.controller';
import { protect } from '../middlewares/auth.middleware';

const storeCheckoutConfigurationRouter = Router();

storeCheckoutConfigurationRouter.use(protect);

/** GET /api/store-checkout-configurations/store/:storeId */
storeCheckoutConfigurationRouter.get('/store/:storeId', getStoreCheckoutConfigurationByStoreId);

/** GET /api/store-checkout-configurations/:id */
storeCheckoutConfigurationRouter.get('/:id', getStoreCheckoutConfigurationById);

/** POST /api/store-checkout-configurations */
storeCheckoutConfigurationRouter.post('/', createStoreCheckoutConfiguration);

/** PUT /api/store-checkout-configurations/:id */
storeCheckoutConfigurationRouter.put('/:id', updateStoreCheckoutConfiguration);

/** DELETE /api/store-checkout-configurations/:id */
storeCheckoutConfigurationRouter.delete('/:id', deleteStoreCheckoutConfiguration);

export default storeCheckoutConfigurationRouter;
