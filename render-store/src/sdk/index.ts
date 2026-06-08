export { useStorefront } from '@/contexts/store.context';
export { useThemeConfig, getThemeConfigValue } from '@/contexts/theme-config.context';
export type { ThemeConfig } from '@/contexts/theme-config.context';
export { useStorefrontAuth } from '@/contexts/storefront-auth.context';
export { useStorefrontProducts } from '@/contexts/product.context';
export { useStorefrontCollections } from '@/contexts/storefront-collections.context';
export { useStorefrontOrder } from '@/contexts/storefront-order.context';
export { useStorefrontCart } from '@/contexts/storefront-cart.context';
export { useStorefrontProductVariants } from '@/contexts/product-variant.context';
export { formatINR } from '@/utils/currency';
export { isThemeEditorPreview } from '@/utils/theme-editor-preview';
export { useThemeEditorPreview } from '@/hooks/useThemeEditorPreview';
export {
  usePreviewHighlightNodeId,
  layoutBlockIdFromHighlightNodeId,
} from '@/hooks/usePreviewHighlightNodeId';

export type {
  StorefrontUser,
} from '@/contexts/storefront-auth.context';

export type {
  StorefrontProductItem,
  StorefrontProductDetailItem,
} from '@/contexts/product.context';

export type {
  StorefrontCollection,
} from '@/contexts/storefront-collections.context';

export type {
  StorefrontOrder,
} from '@/contexts/storefront-order.context';

export type {
  StorefrontCartItem,
  GuestCartItem,
} from '@/contexts/storefront-cart.context';

export type {
  StorefrontProductVariant,
} from '@/contexts/product-variant.context';
