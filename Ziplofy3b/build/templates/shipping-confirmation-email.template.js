"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPPING_CONFIRMATION_EMAIL_BODY = exports.SHIPPING_CONFIRMATION_EMAIL_SUBJECT = void 0;
exports.buildSampleShipmentItemsHtml = buildSampleShipmentItemsHtml;
exports.buildShippingConfirmationEmailHtml = buildShippingConfirmationEmailHtml;
exports.getShippingConfirmationEmailBodyTemplate = getShippingConfirmationEmailBodyTemplate;
exports.SHIPPING_CONFIRMATION_EMAIL_SUBJECT = 'A shipment from order #{{order_number}} is on the way';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
function shipmentItemRow(productName, quantity, subtitle) {
    return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60" valign="top" style="padding-right:16px;">
              <img src="${PLACEHOLDER_IMAGE}" alt="" width="60" height="60" style="display:block;border-radius:4px;border:1px solid #e5e5e5;" />
            </td>
            <td valign="top" style="font-size:14px;color:#333333;line-height:1.5;">
              ${productName} &times; ${quantity}
              ${subtitle ? `<br/><span style="font-size:13px;color:#717171;">${subtitle}</span>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}
function buildSampleShipmentItemsHtml() {
    return [
        shipmentItemRow('Running shoes', 1),
        shipmentItemRow('Yoga mat', 1),
        shipmentItemRow('Resistance bands', 1),
        shipmentItemRow('Dumbbell set', 1),
        shipmentItemRow('Gift box', 1, 'Part of: Gift bundle'),
        shipmentItemRow('Gift card holder', 1, 'Part of: Gift bundle'),
        shipmentItemRow('Protein powder', 1),
        shipmentItemRow('Meditation app subscription', 1),
        shipmentItemRow('E-book: Fitness Guide', 1),
    ].join('');
}
function buildShippingConfirmationEmailHtml(variables) {
    const shipmentItemsHtml = variables.shipment_items_html || buildSampleShipmentItemsHtml();
    const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shipping confirmation</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Your order is on the way</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">Your order is on the way. Track your shipment to see the delivery status.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="{{view_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:4px;background-color:#1990c6;">View your order</a>
                  </td>
                  <td>
                    <a href="{{tracking_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:4px;background-color:#5433eb;">Track order with shop</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;">
                or <a href="{{store_url}}" style="color:#1990c6;text-decoration:none;">Visit our store</a>
              </p>
              <p style="margin:0;font-size:14px;color:#333333;line-height:1.6;">
                {{carrier_name}} tracking number:
                <a href="{{tracking_url}}" style="color:#1990c6;text-decoration:none;">{{tracking_number}}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Items in this shipment</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${shipmentItemsHtml}
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
</html>`;
    let html = template;
    const merged = {
        store_name: 'My Store',
        order_number: '9999',
        view_order_url: '#',
        tracking_url: '#',
        store_url: '#',
        carrier_name: 'UPS',
        tracking_number: '1Z5F44813600X02768',
        support_email: 'support@example.com',
        ...variables,
    };
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function getShippingConfirmationEmailBodyTemplate() {
    return buildShippingConfirmationEmailHtml({
        store_name: '{{store_name}}',
        order_number: '{{order_number}}',
        view_order_url: '{{view_order_url}}',
        tracking_url: '{{tracking_url}}',
        store_url: '{{store_url}}',
        carrier_name: '{{carrier_name}}',
        tracking_number: '{{tracking_number}}',
        support_email: '{{support_email}}',
    });
}
exports.SHIPPING_CONFIRMATION_EMAIL_BODY = getShippingConfirmationEmailBodyTemplate();
