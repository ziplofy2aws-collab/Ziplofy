import { Router } from 'express';
import {
  createStorePrivacyPolicy,
  updateStorePrivacyPolicy,
  getStorePrivacyPolicyByStoreId,
} from '../controllers/store-privacy-policy.controller';

const router = Router();

// POST /api/store-privacy-policy
router.post('/', createStorePrivacyPolicy);

// PUT /api/store-privacy-policy/:id
router.put('/:id', updateStorePrivacyPolicy);

// GET /api/store-privacy-policy/store/:storeId
router.get('/store/:storeId', getStorePrivacyPolicyByStoreId);

export default router;
