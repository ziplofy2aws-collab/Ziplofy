export interface PaymentVerificationAcknowledgementEmailParams {
  customerName: string;
  storeName: string;
  orderNumber: string;
  amount: number;
  utr: string;
  paymentMethod: 'bank_transfer' | 'upi_id';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getPaymentVerificationAcknowledgementEmailSubject(orderNumber: string): string {
  return `Payment verified for order #${orderNumber}`;
}

export function buildPaymentVerificationAcknowledgementEmailHtml(
  params: PaymentVerificationAcknowledgementEmailParams
): string {
  const customerName = escapeHtml(params.customerName || 'Customer');
  const storeName = escapeHtml(params.storeName || 'Store');
  const orderNumber = escapeHtml(params.orderNumber);
  const utr = escapeHtml(params.utr);
  const paymentMethod =
    params.paymentMethod === 'bank_transfer' ? 'Bank transfer' : 'UPI';
  const amount = `₹${Number(params.amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment verified</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f7;font-family:Arial,sans-serif;color:#202223;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f6f6f7;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e1e3e5;border-radius:8px;">
        <tr><td style="padding:28px 32px;border-bottom:1px solid #e1e3e5;font-size:20px;font-weight:600;">${storeName}</td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:24px;">Your payment has been verified</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#6d7175;">Hi ${customerName}, we have verified your payment for order #${orderNumber}. Your order payment is now marked as paid.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f7;border-radius:6px;padding:16px;">
            <tr><td style="padding:5px 0;color:#6d7175;">Amount</td><td align="right" style="padding:5px 0;font-weight:600;">${amount}</td></tr>
            <tr><td style="padding:5px 0;color:#6d7175;">Payment method</td><td align="right" style="padding:5px 0;">${paymentMethod}</td></tr>
            <tr><td style="padding:5px 0;color:#6d7175;">UTR number</td><td align="right" style="padding:5px 0;font-family:monospace;">${utr}</td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;color:#6d7175;">Thank you for your payment.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
