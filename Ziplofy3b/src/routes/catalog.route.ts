import { Router } from 'express';
import { createCatalog, deleteCatalog, getCatalogsByStoreId, updateCatalog } from '../controllers/catalog.controller';

const catalogRouter = Router();

catalogRouter.post('/', createCatalog);
catalogRouter.put('/:id', updateCatalog);
catalogRouter.delete('/:id', deleteCatalog);
catalogRouter.get('/store/:storeId', getCatalogsByStoreId);

export default catalogRouter;


