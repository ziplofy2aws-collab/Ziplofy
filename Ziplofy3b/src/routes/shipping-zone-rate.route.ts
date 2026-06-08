import { Router } from 'express';
import {
  createShippingZoneRate,
  getShippingZoneRatesByZoneId,
  updateShippingZoneRate,
  deleteShippingZoneRate,
} from '../controllers/shipping-zone-rate.controller';

const shippingZoneRateRouter = Router();

shippingZoneRateRouter.post('/', createShippingZoneRate);
shippingZoneRateRouter.get('/zone/:shippingZoneId', getShippingZoneRatesByZoneId);
shippingZoneRateRouter.put('/:id', updateShippingZoneRate);
shippingZoneRateRouter.delete('/:id', deleteShippingZoneRate);

export default shippingZoneRateRouter;

