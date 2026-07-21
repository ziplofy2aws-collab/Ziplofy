import { Router } from 'express';
import {
  getShippingProfileProductVariantEntries,
  createShippingProfileProductVariantEntry,
  deleteShippingProfileProductVariantEntry,
} from '../controllers/shipping-profile-product-variants-entry.controller';

const shippingProfileProductVariantsEntryRouter = Router();

shippingProfileProductVariantsEntryRouter.get('/:profileId', getShippingProfileProductVariantEntries);
shippingProfileProductVariantsEntryRouter.post('/:profileId', createShippingProfileProductVariantEntry);
shippingProfileProductVariantsEntryRouter.delete('/:id', deleteShippingProfileProductVariantEntry);

export default shippingProfileProductVariantsEntryRouter;

