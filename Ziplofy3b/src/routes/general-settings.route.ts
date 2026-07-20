import { Router } from 'express';
import {
  getGeneralSettingsByStoreId,
  updateGeneralSettings,
} from '../controllers/general-settings.controller';

const generalSettingsRouter = Router();

generalSettingsRouter.put('/:id', updateGeneralSettings);
generalSettingsRouter.get('/store/:storeId', getGeneralSettingsByStoreId);

export default generalSettingsRouter;


