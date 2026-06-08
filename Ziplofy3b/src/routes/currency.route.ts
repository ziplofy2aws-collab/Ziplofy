import { Router } from 'express';
import { getCurrencies } from '../controllers/currency.controller';

const currencyRouter = Router();

currencyRouter.get('/', getCurrencies);

export default currencyRouter;


