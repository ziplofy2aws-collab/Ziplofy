const CHECKOUT_PREVIEW_CURRENCY = 'INR';

export function formatCheckoutPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CHECKOUT_PREVIEW_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function checkoutPreviewCurrencyCode(): string {
  return CHECKOUT_PREVIEW_CURRENCY;
}
