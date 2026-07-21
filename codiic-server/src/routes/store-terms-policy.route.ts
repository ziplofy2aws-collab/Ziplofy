import { Router } from 'express';
import { createStoreTermsPolicy, getStoreTermsPolicyByStoreId, updateStoreTermsPolicy } from '../controllers/store-terms-policy.controller';

const storeTermsPolicyRouter = Router();

storeTermsPolicyRouter.post('/', createStoreTermsPolicy);
storeTermsPolicyRouter.put('/:id', updateStoreTermsPolicy);
storeTermsPolicyRouter.get('/store/:storeId', getStoreTermsPolicyByStoreId);

export default storeTermsPolicyRouter;


