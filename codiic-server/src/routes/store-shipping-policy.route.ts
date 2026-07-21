import { Router } from 'express';
import { createStoreShippingPolicy, getStoreShippingPolicyByStoreId, updateStoreShippingPolicy } from '../controllers/store-shipping-policy.controller';

const storeShippingPolicyRouter = Router();

storeShippingPolicyRouter.post('/', createStoreShippingPolicy);
storeShippingPolicyRouter.put('/:id', updateStoreShippingPolicy);
storeShippingPolicyRouter.get('/store/:storeId', getStoreShippingPolicyByStoreId);

export default storeShippingPolicyRouter;


