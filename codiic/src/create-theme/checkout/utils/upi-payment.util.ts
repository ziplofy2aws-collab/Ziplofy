/** Build a standard UPI deep-link used by phone UPI apps when scanning a QR. */
export function buildUpiPayUri(params: {
  upiId: string;
  payeeName?: string;
  amount?: number;
  transactionNote?: string;
  currency?: string;
}): string {
  const pa = params.upiId.trim().toLowerCase();
  const search = new URLSearchParams();
  search.set('pa', pa);
  if (params.payeeName?.trim()) {
    search.set('pn', params.payeeName.trim());
  }
  if (typeof params.amount === 'number' && Number.isFinite(params.amount) && params.amount > 0) {
    search.set('am', params.amount.toFixed(2));
  }
  search.set('cu', params.currency?.trim() || 'INR');
  if (params.transactionNote?.trim()) {
    search.set('tn', params.transactionNote.trim().slice(0, 50));
  }
  return `upi://pay?${search.toString()}`;
}
