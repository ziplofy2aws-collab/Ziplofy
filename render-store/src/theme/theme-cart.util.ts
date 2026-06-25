export function readThemeCartCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const cart = (settings?.cart ?? {}) as Record<string, unknown>;
  const productTitleCase = cart.productTitleCase === 'uppercase' ? 'uppercase' : 'none';

  return {
    '--ziplofy-cart-product-title-transform': productTitleCase,
  };
}
