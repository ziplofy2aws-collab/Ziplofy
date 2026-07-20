import { Router } from 'express';
import { createCatalogMarket, deleteCatalogMarket, getCatalogMarketsByCatalogId } from '../controllers/catalog-market.controller';

const catalogMarketRouter = Router();

catalogMarketRouter.post('/', createCatalogMarket);
catalogMarketRouter.delete('/:id', deleteCatalogMarket);
catalogMarketRouter.get('/catalog/:catalogId', getCatalogMarketsByCatalogId);

export default catalogMarketRouter;


