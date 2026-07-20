import { Router } from 'express';
import { updateCatalogProductVariant } from '../controllers/catalog-product-variant.controller';

const catalogProductVariantRouter = Router();

catalogProductVariantRouter.put('/:id', updateCatalogProductVariant);

export default catalogProductVariantRouter;


