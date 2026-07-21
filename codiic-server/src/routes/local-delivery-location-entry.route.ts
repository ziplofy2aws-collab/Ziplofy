import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { getLocalDeliveryLocationEntriesByLocalDeliveryId } from '../controllers/local-delivery-location-entry.controller';

const localDeliveryLocationEntryRouter = express.Router();

localDeliveryLocationEntryRouter.use(protect);

localDeliveryLocationEntryRouter.get(
  '/local-delivery/:localDeliveryId',
  getLocalDeliveryLocationEntriesByLocalDeliveryId
);

export default localDeliveryLocationEntryRouter;

