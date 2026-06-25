export function readThemePriceCurrencyFlags(
  config: Record<string, unknown> | null | undefined
): Record<string, boolean> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const prices = (settings?.prices ?? {}) as Record<string, unknown>;
  const currencyCode = (prices.currencyCode ?? {}) as Record<string, unknown>;

  const readBool = (value: unknown, fallback: boolean) => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return fallback;
  };

  return {
    productPages: readBool(currencyCode.productPages, true),
    productCards: readBool(currencyCode.productCards, true),
    cartItems: readBool(currencyCode.cartItems, true),
    cartTotal: readBool(currencyCode.cartTotal, true),
  };
}
