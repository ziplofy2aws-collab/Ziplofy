import { Router } from 'express';
import {
  createShippingZone,
  getShippingZonesByShippingProfileId,
  updateShippingZone,
  deleteShippingZone,
} from '../controllers/shipping-zone.controller';

const shippingZoneRouter = Router();

shippingZoneRouter.post('/', createShippingZone);
shippingZoneRouter.get('/profile/:shippingProfileId', getShippingZonesByShippingProfileId);
shippingZoneRouter.put('/:id', updateShippingZone);
shippingZoneRouter.delete('/:id', deleteShippingZone);

export default shippingZoneRouter;

