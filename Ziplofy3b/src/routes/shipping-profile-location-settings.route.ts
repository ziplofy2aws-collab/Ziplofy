import { Router } from 'express';
import {
  getShippingProfileLocationSettings,
  updateShippingProfileLocationSetting,
} from '../controllers/shipping-profile-location-settings.controller';

const shippingProfileLocationSettingsRouter = Router();

shippingProfileLocationSettingsRouter.get('/:profileId', getShippingProfileLocationSettings);
shippingProfileLocationSettingsRouter.put('/:profileId/location/:locationId', updateShippingProfileLocationSetting);

export default shippingProfileLocationSettingsRouter;

