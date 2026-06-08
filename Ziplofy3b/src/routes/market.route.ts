import { Router } from 'express';
import { createMarket, updateMarket, deleteMarket, getMarketsByStoreId, getMarketCountriesByStoreId } from '../controllers/market.controller';

const router = Router();

router.post('/', createMarket);
router.put('/:id', updateMarket);
router.delete('/:id', deleteMarket);
router.get('/store/:storeId', getMarketsByStoreId);
router.get('/store/:storeId/countries', getMarketCountriesByStoreId);

export default router;


