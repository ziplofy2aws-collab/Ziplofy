import { Router } from 'express';
import {
  createStoreBanner,
  getStoreBannersByStoreId,
  updateStoreBanner,
} from '../controllers/store-banner.controller';

const storeBannerRouter = Router();

storeBannerRouter.post('/', createStoreBanner);
storeBannerRouter.put('/:id', updateStoreBanner);
storeBannerRouter.get('/store/:storeId', getStoreBannersByStoreId);

export default storeBannerRouter;
