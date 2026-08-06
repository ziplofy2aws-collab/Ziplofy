import { Router } from 'express';
import { listPlatformPaymentIntents } from '../controllers/platform-payment-intent.controller';
import { protect } from '../middlewares/auth.middleware';

export const platformPaymentIntentRouter = Router();

platformPaymentIntentRouter.use(protect);
platformPaymentIntentRouter.get('/', listPlatformPaymentIntents);
