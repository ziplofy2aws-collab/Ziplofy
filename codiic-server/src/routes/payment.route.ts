import { Router } from 'express';
import { confirmPayment, getPaymentsByStoreId } from '../controllers/payment.controller';

const paymentRouter = Router();

paymentRouter.post('/confirm', confirmPayment);
paymentRouter.get('/store/:storeId', getPaymentsByStoreId);

export default paymentRouter;
