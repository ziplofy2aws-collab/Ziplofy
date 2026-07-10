import { Router } from 'express';
import {
  connectStorePaymentProvider,
  disconnectStorePaymentProvider,
  getPaymentProviderByKey,
  getPaymentProviders,
  getStorePaymentProviders,
} from '../controllers/payment-provider.controller';
import { protect } from '../middlewares/auth.middleware';

export const paymentProviderRouter = Router();

paymentProviderRouter.use(protect);

paymentProviderRouter.get('/', getPaymentProviders);
paymentProviderRouter.get('/store', getStorePaymentProviders);
paymentProviderRouter.get('/:key', getPaymentProviderByKey);
paymentProviderRouter.post('/connect', connectStorePaymentProvider);
paymentProviderRouter.delete('/store/:id', disconnectStorePaymentProvider);
