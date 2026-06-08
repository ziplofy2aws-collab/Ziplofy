import { Router } from 'express';
import { createStoreContactInfo, getStoreContactInfoByStoreId, updateStoreContactInfo } from '../controllers/store-contact-info.controller';

const storeContactInfoRouter = Router();

// Create (or upsert)
storeContactInfoRouter.post('/', createStoreContactInfo);

// Update by id
storeContactInfoRouter.put('/:id', updateStoreContactInfo);

// Get by store id
storeContactInfoRouter.get('/store/:storeId', getStoreContactInfoByStoreId);

export default storeContactInfoRouter;


