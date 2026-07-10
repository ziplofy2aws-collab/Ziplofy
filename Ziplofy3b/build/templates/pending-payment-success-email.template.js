"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PENDING_PAYMENT_SUCCESS_EMAIL_BODY = exports.PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT = void 0;
exports.buildPendingPaymentSuccessEmailHtml = buildPendingPaymentSuccessEmailHtml;
const order_confirmation_email_template_1 = require("./order-confirmation-email.template");
const ready_for_local_pickup_email_template_1 = require("./ready-for-local-pickup-email.template");
exports.PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT = '[{{store_name}}] Payment processed successfully';
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
function buildPendingPaymentSuccessEmailHtml(variables) {
    const orderItemsHtml = variables.order_items_html || (0, ready_for_local_pickup_email_template_1.buildSamplePickupOrderItemsHtml)();
    const orderTotalsHtml = variables.order_totals_html || (0, ready_for_local_pickup_email_template_1.buildPickupOrderTotalsHtml)();
    const customerInfoHtml = variables.customer_info_html || (0, order_confirmation_email_template_1.buildCustomerInfoHtml)();
    return replaceVariables(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Pending payment success</title></head>
<body style="margin:0;padding:0;background-color:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f6f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e5e5;">
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #e5e5e5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
            <td style="font-size:20px;font-weight:600;color:#333333;">{{store_name}}</td>
            <td align="right" style="font-size:12px;color:#717171;letter-spacing:0.04em;text-transform:uppercase;">ORDER #{{order_number}}</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;">Your payment was processed</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">The pending payment for your order has been processed successfully. Thank you for your purchase.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;"><tr>
            <td style="border-radius:4px;background-color:#1990c6;">
              <a href="{{view_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">View your order</a>
            </td>
          </tr></table>
          <p style="margin:0;font-size:14px;color:#717171;">or <a href="{{store_url}}" style="color:#1990c6;text-decoration:none;">Visit our store</a></p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Order summary</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${orderItemsHtml}</table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
            <tr><td width="45%"></td><td width="55%">${orderTotalsHtml}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:32px;border-top:1px solid #e5e5e5;">
          <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Customer information</h2>
          ${customerInfoHtml}
        </td></tr>
        <tr><td style="padding:24px 32px 32px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:14px;color:#717171;">Questions? Contact us at <a href="mailto:{{support_email}}" style="color:#1990c6;text-decoration:none;">{{support_email}}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`, variables);
}
exports.PENDING_PAYMENT_SUCCESS_EMAIL_BODY = buildPendingPaymentSuccessEmailHtml({
    store_name: '{{store_name}}',
    order_number: '{{order_number}}',
    view_order_url: '{{view_order_url}}',
    store_url: '{{store_url}}',
    support_email: '{{support_email}}',
});
