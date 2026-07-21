import {
  buildCustomerInfoHtml,
} from './order-confirmation-email.template';
import {
  buildPickupOrderTotalsHtml,
  buildSamplePickupOrderItemsHtml,
} from './ready-for-local-pickup-email.template';

export const PAYMENT_REMINDER_EMAIL_SUBJECT =
  '[{{store_name}}] Payment reminder for order #{{order_number}}';

function replaceVariables(template: string, variables: Record<string, string>): string {
  const merged = {
    store_name: 'My Store',
    order_number: '9999',
    amount_due: 'Rs. 404.95',
    pay_now_url: '#',
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

export function buildPaymentReminderEmailHtml(variables: Record<string, string>): string {
  const orderItemsHtml = variables.order_items_html || buildSamplePickupOrderItemsHtml();
  const orderTotalsHtml = variables.order_totals_html || buildPickupOrderTotalsHtml({
    total: 'Rs. 404.95 INR',
  });
  const customerInfoHtml = variables.customer_info_html || buildCustomerInfoHtml();

  return replaceVariables(
    `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Payment reminder</title></head>
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
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;">Payment of {{amount_due}} is due</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">This is a friendly reminder that payment for your order is due. Please complete your payment to avoid any delays.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;"><tr>
            <td style="padding-right:8px;">
              <a href="{{pay_now_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:4px;background-color:#1990c6;">Pay now</a>
            </td>
          </tr></table>
          <p style="margin:0;font-size:14px;color:#717171;">or <a href="{{view_order_url}}" style="color:#1990c6;text-decoration:none;">View your order</a></p>
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
</body></html>`,
    variables
  );
}

export const PAYMENT_REMINDER_EMAIL_BODY = buildPaymentReminderEmailHtml({
  store_name: '{{store_name}}',
  order_number: '{{order_number}}',
  amount_due: '{{amount_due}}',
  pay_now_url: '{{pay_now_url}}',
  view_order_url: '{{view_order_url}}',
  store_url: '{{store_url}}',
  support_email: '{{support_email}}',
});
