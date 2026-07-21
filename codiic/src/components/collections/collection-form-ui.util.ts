import { productFormInputClass } from '../products/product-form-appearance';
import { COLLECTION_FORM_APPEARANCE } from './collection-form.types';

export const collectionInputClass = productFormInputClass(COLLECTION_FORM_APPEARANCE);

export const collectionSecondaryButtonClass =
  'rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50';

export const collectionPrimaryButtonClass =
  'rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const collectionMutedAddButtonClass =
  'rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed';

export const collectionProductRowClass =
  'flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0 transition-colors hover:bg-gray-50/60';

export const collectionProductsPanelClass =
  'rounded-md border border-gray-200/60 bg-gray-50/30';
