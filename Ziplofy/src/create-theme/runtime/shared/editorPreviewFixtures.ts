import type { GuestCartItem, StorefrontProductVariant } from '@render-store/sdk';

const PREVIEW_STORE_ID = 'preview-store';
const NOW = '2026-01-15T12:00:00.000Z';

const previewVariant = (id: string, sku: string, price: number): StorefrontProductVariant => ({
  _id: id,
  productId: 'preview-product',
  optionValues: { Size: 'M' },
  sku,
  barcode: null,
  price,
  chargeTax: true,
  images: [],
  createdAt: NOW,
  updatedAt: NOW,
});

/** Cart line items for editor preview when the cart API returns nothing. */
export const PREVIEW_CART_LINES: GuestCartItem[] = [
  {
    _id: 'preview_cart_1',
    storeId: PREVIEW_STORE_ID,
    productVariantId: previewVariant('preview-variant-1', 'Bloom Serum — 30ml', 1299),
    quantity: 1,
    createdAt: NOW,
  },
  {
    _id: 'preview_cart_2',
    storeId: PREVIEW_STORE_ID,
    productVariantId: previewVariant('preview-variant-2', 'Velvet Lip Tint — Rose', 899),
    quantity: 2,
    createdAt: NOW,
  },
];
