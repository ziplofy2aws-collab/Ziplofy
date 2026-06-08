/**
 * Format amount (stored in paisa/cents) as INR display string.
 * Example: formatINR(10050) => "₹100.50"
 */
export const formatINR = (amountInPaisa: number): string => {
  return `₹${(amountInPaisa / 100).toFixed(2)}`;
};
