import { Router } from 'express';
import {
  createShippingProfile,
  getShippingProfilesByStoreId,
  updateShippingProfile,
  deleteShippingProfile,
} from '../controllers/shipping-profile.controller';

const shippingProfileRouter = Router();

shippingProfileRouter.post('/', createShippingProfile);
shippingProfileRouter.get('/store/:storeId', getShippingProfilesByStoreId);
shippingProfileRouter.put('/:id', updateShippingProfile);
shippingProfileRouter.delete('/:id', deleteShippingProfile);

export default shippingProfileRouter;

