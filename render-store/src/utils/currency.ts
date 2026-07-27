/**
 * Format minor currency units (paisa/cents) for display.
 * Example: formatMoney(10050, 'INR') => "₹100.50"
 */
export function formatMoney(
  amountInMinorUnits: number,
  currencyCode = 'INR',
  locale = 'en-IN'
): string {
  const amount = (Number.isFinite(amountInMinorUnits) ? amountInMinorUnits : 0) / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode || 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode || ''} ${amount.toFixed(2)}`.trim();
  }
}

/**
 * Format amount (stored in paisa/cents) as INR display string.
 * Example: formatINR(10050) => "₹100.50"
 * @deprecated Prefer formatMoney(amount, 'INR') for multi-currency themes.
 */
export const formatINR = (amountInPaisa: number): string => {
  return formatMoney(amountInPaisa, 'INR', 'en-IN');
};
