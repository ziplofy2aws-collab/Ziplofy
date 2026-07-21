import express from 'express';
import { createLocalDeliverySettings, getLocalDeliverySettingsByStoreId } from '../controllers/local-delivery-settings.controller';
import { protect } from '../middlewares/auth.middleware';

const localDeliverySettingsRouter = express.Router();

localDeliverySettingsRouter.use(protect);

localDeliverySettingsRouter.post('/', createLocalDeliverySettings);
localDeliverySettingsRouter.get('/store/:storeId', getLocalDeliverySettingsByStoreId);

export default localDeliverySettingsRouter;

