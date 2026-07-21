import { Router } from 'express';
import {
  generateNewSecurityCode,
  getSecuritySettingsByStoreId,
  updateSecuritySettings,
} from '../controllers/store-security-settings.controller';

const storeSecuritySettingsRouter = Router();

// CRUD
storeSecuritySettingsRouter.get('/:storeId', getSecuritySettingsByStoreId);
storeSecuritySettingsRouter.patch('/:id', updateSecuritySettings); // For creation when create: true
storeSecuritySettingsRouter.get('/:id/generateNewCode', generateNewSecurityCode);

export default storeSecuritySettingsRouter;

