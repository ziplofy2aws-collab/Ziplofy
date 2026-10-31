import type {
  GuestCartItem,
  StorefrontOrder,
  StorefrontProductVariant,
  StorefrontUser,
} from '@render-store/sdk';

const PREVIEW_STORE_ID = 'preview-store';
const NOW = '2026-01-15T12:00:00.000Z';

/** Sample customer shown in the theme editor when auth APIs have no session. */
export const PREVIEW_STOREFRONT_USER: StorefrontUser = {
  _id: 'preview-customer',
  storeId: PREVIEW_STORE_ID,
  firstName: 'Alex',
  lastName: 'Morgan',
  language: 'en',
  email: 'alex.morgan@example.com',
  phoneNumber: '+1 555 010 2244',
  isVerified: true,
  agreedToMarketingEmails: true,
  agreedToSmsMarketing: false,
  collectTax: 'collect',
  tagIds: [],
  createdAt: NOW,
  updatedAt: NOW,
};

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

const previewCustomer = {
  _id: PREVIEW_STOREFRONT_USER._id,
  storeId: PREVIEW_STORE_ID,
  firstName: PREVIEW_STOREFRONT_USER.firstName,
  lastName: PREVIEW_STOREFRONT_USER.lastName,
  language: 'en',
  email: PREVIEW_STOREFRONT_USER.email,
  phoneNumber: PREVIEW_STOREFRONT_USER.phoneNumber,
  agreedToMarketingEmails: true,
  agreedToSmsMarketing: false,
  collectTax: 'collect' as const,
  tagIds: [] as string[],
  createdAt: NOW,
  updatedAt: NOW,
};

const previewAddress = {
  _id: 'preview-address',
  customerId: PREVIEW_STOREFRONT_USER._id,
  country: 'United States',
  firstName: 'Alex',
  lastName: 'Morgan',
  address: '128 Bloom Street',
  city: 'San Francisco',
  state: 'CA',
  pinCode: '94102',
  phoneNumber: '+1 555 010 2244',
  addressType: 'shipping',
  createdAt: NOW,
  updatedAt: NOW,
};

/** Order cards for editor preview when the orders API returns nothing. */
export const PREVIEW_ORDERS: StorefrontOrder[] = [
  {
    _id: 'preview-order-2401',
    storeId: PREVIEW_STORE_ID,
    customerId: previewCustomer,
    shippingAddressId: previewAddress,
    orderDate: '2026-01-10',
    status: 'delivered',
    paymentStatus: 'paid',
    subtotal: 3497,
    tax: 280,
    shippingCost: 0,
    total: 3777,
    createdAt: NOW,
    updatedAt: NOW,
    items: [],
  },
  {
    _id: 'preview-order-2398',
    storeId: PREVIEW_STORE_ID,
    customerId: previewCustomer,
    shippingAddressId: previewAddress,
    orderDate: '2025-12-28',
    status: 'shipped',
    paymentStatus: 'paid',
    subtotal: 1299,
    tax: 104,
    shippingCost: 99,
    total: 1502,
    createdAt: NOW,
    updatedAt: NOW,
    items: [],
  },
];
