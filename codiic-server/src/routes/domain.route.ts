import { Router } from 'express';
import {
  connectDomain,
  disconnectDomain,
  listStoreDomains,
  verifyDomain,
} from '../controllers/domain.controller';
import { protect } from '../middlewares/auth.middleware';

export const domainRouter = Router();

domainRouter.use(protect);

domainRouter.get('/store/:storeId', listStoreDomains);
domainRouter.post('/connect', connectDomain);
domainRouter.post('/verify', verifyDomain);
domainRouter.delete('/:id', disconnectDomain);
