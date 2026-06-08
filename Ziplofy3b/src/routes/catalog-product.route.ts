import { Router } from 'express';
import { createCatalogProduct, deleteCatalogProduct, getCatalogProductsByCatalogId, updateCatalogProductVariant } from '../controllers/catalog-product.controller';

const catalogProductRouter = Router();

catalogProductRouter.post('/', createCatalogProduct);
catalogProductRouter.delete('/:id', deleteCatalogProduct);
catalogProductRouter.get('/catalog/:catalogId', getCatalogProductsByCatalogId);
catalogProductRouter.put('/:id', updateCatalogProductVariant);

export default catalogProductRouter;


