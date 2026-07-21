import { Router } from 'express';
import {
  getOnlineStorePreferencesByStoreId,
  updateOnlineStorePreferences,
} from '../controllers/online-store-preferences.controller';

const onlineStorePreferencesRouter = Router();

onlineStorePreferencesRouter.get('/store/:storeId', getOnlineStorePreferencesByStoreId);
onlineStorePreferencesRouter.put('/:id', updateOnlineStorePreferences);

export default onlineStorePreferencesRouter;
