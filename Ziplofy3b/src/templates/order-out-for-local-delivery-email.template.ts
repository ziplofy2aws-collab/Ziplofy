import { buildSampleShipmentItemsHtml } from './shipping-confirmation-email.template';

export const ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT =
  'Your order is out for delivery';

function replaceVariables(template: string, variables: Record<string, string>): string {
  const merged = {
    store_name: 'My Store',
    order_number: '9999',
    view_order_url: '#',
    tracking_url: '#',
    store_url: '#',
    delivery_name: 'Jane Customer',
    delivery_address_line1: '123 Delivery Street',
    delivery_address_line2: 'Apt 4B',
    delivery_city: 'Ottawa',
    delivery_state: 'Ontario',
    delivery_zip: 'K1N5TS',
    support_email: 'support@example.com',
    ...variables,
  };

  let html = template;
  for (const [key, value] of Object.entries(merged)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return html.trim();
}

export function buildOrderOutForLocalDeliveryEmailHtml(variables: Record<string, string>): string {
  const shipmentItemsHtml = variables.shipment_items_html || buildSampleShipmentItemsHtml();

  return replaceVariables(
    `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order out for local delivery</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Your order is out for delivery</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">Your order is on its way. Track your delivery to see when it will arrive.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="{{view_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:4px;background-color:#1990c6;">View your order</a>
                  </td>
                  <td>
                    <a href="{{tracking_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:4px;background-color:#5433eb;">Track delivery</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;">
                or <a href="{{store_url}}" style="color:#1990c6;text-decoration:none;">Visit our store</a>
              </p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333333;">Delivery address</p>
              <p style="margin:0;font-size:14px;color:#333333;line-height:1.6;">
                {{delivery_name}}<br/>
                {{delivery_address_line1}}<br/>
                {{delivery_address_line2}}<br/>
                {{delivery_city}} {{delivery_state}} {{delivery_zip}}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Items in this delivery</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${shipmentItemsHtml}</table>
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

export function getOrderOutForLocalDeliveryEmailBodyTemplate(): string {
  return buildOrderOutForLocalDeliveryEmailHtml({
    store_name: '{{store_name}}',
    order_number: '{{order_number}}',
    view_order_url: '{{view_order_url}}',
    tracking_url: '{{tracking_url}}',
    store_url: '{{store_url}}',
    delivery_name: '{{delivery_name}}',
    delivery_address_line1: '{{delivery_address_line1}}',
    delivery_address_line2: '{{delivery_address_line2}}',
    delivery_city: '{{delivery_city}}',
    delivery_state: '{{delivery_state}}',
    delivery_zip: '{{delivery_zip}}',
    support_email: '{{support_email}}',
  });
}

export const ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_BODY =
  getOrderOutForLocalDeliveryEmailBodyTemplate();
