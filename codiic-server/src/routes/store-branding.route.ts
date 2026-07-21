import { Router } from 'express';
import {
  createStoreBranding,
  getStoreBrandingByStoreId,
  updateStoreBranding,
} from '../controllers/store-branding.controller';

const storeBrandingRouter = Router();

storeBrandingRouter.post('/', createStoreBranding);
storeBrandingRouter.put('/:id', updateStoreBranding);
storeBrandingRouter.get('/store/:storeId', getStoreBrandingByStoreId);

export default storeBrandingRouter;


