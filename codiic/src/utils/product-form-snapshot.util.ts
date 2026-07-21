import type { NewProductFormData } from '../hooks/useNewProductForm';
import { descriptionsAreEquivalent } from './product-description-html.util';

export type ProductFormSnapshot = {
  formData: NewProductFormData;
  mediaUrls: string[];
};

export function buildProductFormSnapshot(
  formData: NewProductFormData,
  mediaUrls: string[]
): ProductFormSnapshot {
  return { formData, mediaUrls };
}

function formFieldsEqual(a: NewProductFormData, b: NewProductFormData): boolean {
  const keys = Object.keys(a) as Array<keyof NewProductFormData>;
  for (const key of keys) {
    if (key === 'description' || key === 'images' || key === 'variants') continue;
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return false;
  }
  return true;
}

export function productFormSnapshotsEqual(a: ProductFormSnapshot, b: ProductFormSnapshot): boolean {
  if (JSON.stringify(a.mediaUrls) !== JSON.stringify(b.mediaUrls)) return false;
  if (!formFieldsEqual(a.formData, b.formData)) return false;
  return descriptionsAreEquivalent(a.formData.description, b.formData.description);
}
