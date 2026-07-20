import { Router } from 'express';
import { getSubdomainByStoreId, checkSubdomain } from '../controllers/store-subdomain.controller';
import { protect } from '../middlewares/auth.middleware';

export const storeSubdomainRouter = Router();

// Public: validate a subdomain and return store info
storeSubdomainRouter.get('/check', checkSubdomain);

// Protected: get mapping by store id
storeSubdomainRouter.use(protect);
storeSubdomainRouter.get('/store/:storeId', getSubdomainByStoreId);


