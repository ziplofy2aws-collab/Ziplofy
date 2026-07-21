import {
  buildPickupOrderTotalsHtml,
  buildSamplePickupOrderItemsHtml,
} from './ready-for-local-pickup-email.template';

export const GIFT_CARD_RECEIPT_EMAIL_SUBJECT = 'Gift card receipt';

function replaceVariables(template: string, variables: Record<string, string>): string {
  const merged = {
    store_name: 'My Store',
    order_number: '9999',
    customer_name: 'John Doe',
    recipient_name: 'Jane Doe',
    gift_card_amount: 'Rs. 100',
    gift_card_amount_formatted: 'Rs. 100.00 INR',
    gift_card_code: 'A1B2 3C4D 5E6F 7G8H',
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

export function buildGiftCardReceiptEmailHtml(variables: Record<string, string>): string {
  const orderItemsHtml = variables.order_items_html || buildSamplePickupOrderItemsHtml();
  const orderTotalsHtml = variables.order_totals_html || buildPickupOrderTotalsHtml({
    subtotal: 'Rs. 100.00',
    discount: 'Rs. 0.00',
    discountCode: '',
    shipping: 'Free',
    shippingOriginal: 'Rs. 0.00',
    shippingDiscountCode: '',
    taxes: 'Rs. 0.00',
    total: 'Rs. 100.00 INR',
    savings: 'Rs. 0.00',
  });

  return replaceVariables(
    `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gift card receipt</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f6f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e5e5;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #e5e5e5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size:20px;font-weight:600;color:#333333;">{{store_name}}</td>
                  <td align="right" style="font-size:12px;color:#717171;letter-spacing:0.04em;text-transform:uppercase;">ORDER #{{order_number}}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Gift card receipt</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">
                Hi {{customer_name}}, your gift card for {{gift_card_amount_formatted}} was sent to {{recipient_name}}.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background-color:#fafafa;border:1px solid #e5e5e5;border-radius:4px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333333;">Gift card details</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#333333;">Amount: {{gift_card_amount_formatted}}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#333333;">Recipient: {{recipient_name}}</p>
                    <p style="margin:0;font-size:14px;color:#333333;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:0.08em;">Code: {{gift_card_code}}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td style="border-radius:4px;background-color:#1990c6;">
                    <a href="{{view_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">View your order</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;color:#717171;">
                or <a href="{{store_url}}" style="color:#1990c6;text-decoration:none;">Visit our store</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Order summary</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${orderItemsHtml}</table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr><td width="45%"></td><td width="55%">${orderTotalsHtml}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:14px;color:#717171;line-height:1.6;">
                If you have any questions, reply to this email or contact us at
                <a href="mailto:{{support_email}}" style="color:#1990c6;text-decoration:none;">{{support_email}}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables
  );
}

export function getGiftCardReceiptEmailBodyTemplate(): string {
  return buildGiftCardReceiptEmailHtml({
    store_name: '{{store_name}}',
    order_number: '{{order_number}}',
    customer_name: '{{customer_name}}',
    recipient_name: '{{recipient_name}}',
    gift_card_amount: '{{gift_card_amount}}',
    gift_card_amount_formatted: '{{gift_card_amount_formatted}}',
    gift_card_code: '{{gift_card_code}}',
    view_order_url: '{{view_order_url}}',
    store_url: '{{store_url}}',
    support_email: '{{support_email}}',
  });
}

export const GIFT_CARD_RECEIPT_EMAIL_BODY = getGiftCardReceiptEmailBodyTemplate();
