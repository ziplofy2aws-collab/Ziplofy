import { Router } from 'express';
import {
  getStorefrontPolicyByType,
  getStorefrontWrittenPolicies,
} from '../../controllers/storefront-policies.controller';

export const storeFrontPoliciesRouter = Router();

storeFrontPoliciesRouter.get('/store/:storeId', getStorefrontWrittenPolicies);
storeFrontPoliciesRouter.get('/store/:storeId/type/:policyType', getStorefrontPolicyByType);
