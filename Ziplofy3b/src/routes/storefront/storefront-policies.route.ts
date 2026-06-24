import { Router } from 'express';
import {
  getStorefrontPolicyByType,
  getStorefrontWrittenPoliciesByStoreId,
} from '../../controllers/storefront-policies.controller';

export const storeFrontPoliciesRouter = Router();

storeFrontPoliciesRouter.get('/store/:storeId', getStorefrontWrittenPoliciesByStoreId);
storeFrontPoliciesRouter.get('/store/:storeId/type/:policyType', getStorefrontPolicyByType);
