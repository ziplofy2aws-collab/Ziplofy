import { Router } from 'express';
import {
  createStoreReturnRefundPolicy,
  updateStoreReturnRefundPolicy,
  getStoreReturnRefundPolicyByStoreId,
} from '../controllers/store-return-refund-policy.controller';

const router = Router();

router.post('/', createStoreReturnRefundPolicy);
router.put('/:id', updateStoreReturnRefundPolicy);
router.get('/store/:storeId', getStoreReturnRefundPolicyByStoreId);

export default router;


