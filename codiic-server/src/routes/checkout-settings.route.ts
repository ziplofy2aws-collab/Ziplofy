import { Router } from 'express';
import {
  updateCheckoutSettings,
  getCheckoutSettingsByStoreId,
} from '../controllers/checkout-settings.controller';

const router = Router();

router.put('/:id', updateCheckoutSettings);
router.get('/store/:storeId', getCheckoutSettingsByStoreId);

export default router;
