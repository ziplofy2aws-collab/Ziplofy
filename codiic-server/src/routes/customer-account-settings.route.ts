import { Router } from 'express';
import {
  getCustomerAccountSettingsByStoreId,
  updateCustomerAccountSettings,
} from '../controllers/customer-account-settings.controller';

const customerAccountSettingsRouter = Router();

// GET /api/customer-account-settings/store/:storeId
customerAccountSettingsRouter.get('/store/:storeId', getCustomerAccountSettingsByStoreId);

// PUT /api/customer-account-settings/:id
customerAccountSettingsRouter.put('/:id', updateCustomerAccountSettings);

export default customerAccountSettingsRouter;

