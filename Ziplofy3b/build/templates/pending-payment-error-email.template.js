"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PENDING_PAYMENT_ERROR_EMAIL_BODY = exports.PENDING_PAYMENT_ERROR_EMAIL_SUBJECT = void 0;
exports.buildPendingPaymentErrorEmailHtml = buildPendingPaymentErrorEmailHtml;
exports.PENDING_PAYMENT_ERROR_EMAIL_SUBJECT = '[{{store_name}}] Pending payment couldn\'t be processed';
function replaceVariables(template, variables) {
    const merged = {
        store_name: 'My Store',
        order_number: '9999',
        view_order_url: '#',
        store_url: '#',
        support_email: 'support@example.com',
        ...variables,
    };
    let html = template;
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function buildPendingPaymentErrorEmailHtml(variables) {
    return replaceVariables(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Pending payment error</title></head>
<body style="margin:0;padding:0;background-color:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f6f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e5e5;">
        <tr><td style="padding:48px 32px 32px;">
          <p style="margin:0 0 32px;font-size:20px;font-weight:600;color:#333333;">{{store_name}}</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#333333;">Your pending payment couldn&rsquo;t be processed</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#717171;line-height:1.6;">
            We were unable to process the pending payment for order #{{order_number}}. You haven&rsquo;t been charged.
          </p>
          <p style="margin:0 0 32px;font-size:14px;color:#717171;line-height:1.6;">
            Please review your payment details and try again to complete your order.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;"><tr>
            <td style="border-radius:4px;background-color:#1990c6;">
              <a href="{{view_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">View your order</a>
            </td>
          </tr></table>
          <p style="margin:0;font-size:14px;color:#717171;">or <a href="{{store_url}}" style="color:#1990c6;text-decoration:none;">Visit our store</a></p>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:14px;color:#717171;line-height:1.6;">If you have any questions, reply to this email or contact us at <a href="mailto:{{support_email}}" style="color:#1990c6;text-decoration:none;">{{support_email}}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`, variables);
}
exports.PENDING_PAYMENT_ERROR_EMAIL_BODY = buildPendingPaymentErrorEmailHtml({
    store_name: '{{store_name}}',
    order_number: '{{order_number}}',
    view_order_url: '{{view_order_url}}',
    store_url: '{{store_url}}',
    support_email: '{{support_email}}',
});
