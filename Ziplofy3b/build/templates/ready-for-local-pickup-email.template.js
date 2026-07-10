"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.READY_FOR_LOCAL_PICKUP_EMAIL_BODY = exports.READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT = void 0;
exports.buildSamplePickupOrderItemsHtml = buildSamplePickupOrderItemsHtml;
exports.buildPickupOrderTotalsHtml = buildPickupOrderTotalsHtml;
exports.buildReadyForLocalPickupEmailHtml = buildReadyForLocalPickupEmailHtml;
exports.getReadyForLocalPickupEmailBodyTemplate = getReadyForLocalPickupEmailBodyTemplate;
exports.READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT = 'Your order is ready for pickup';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
function lineItemRow(productName, quantity, price, subtitle, discountNote, compareAtPrice) {
    const priceCell = compareAtPrice
        ? `<span style="text-decoration:line-through;color:#717171;margin-right:6px;">${compareAtPrice}</span>${price}`
        : price;
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
              ${discountNote ? `<br/><span style="font-size:13px;color:#717171;">${discountNote}</span>` : ''}
            </td>
            <td valign="top" align="right" style="font-size:14px;color:#333333;white-space:nowrap;padding-left:16px;">
              ${priceCell}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}
function totalsRow(label, value, bold = false) {
    return `
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#333333;${bold ? 'font-weight:600;padding-top:12px;' : ''}">${label}</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#333333;${bold ? 'font-weight:600;padding-top:12px;' : ''}">${value}</td>
    </tr>`;
}
function buildSamplePickupOrderItemsHtml() {
    return [
        lineItemRow('Aviator sunglasses', 1, 'Rs. 89.99'),
        lineItemRow('Lens Protection Plan (2 Year)', 1, 'Rs. 19.99', 'For: Aviator sunglasses'),
        lineItemRow('Premium Leather Case', 1, 'Rs. 24.99', 'For: Aviator sunglasses'),
        lineItemRow('Mid-century lounger', 1, 'Rs. 154.99', 'Part of: Holiday bundle', 'PROD5 (- Rs. 5.00)', 'Rs. 159.99'),
        lineItemRow('Coffee table', 1, 'Rs. 119.99', 'Part of: Holiday bundle'),
    ].join('');
}
function buildPickupOrderTotalsHtml(options) {
    const o = {
        subtotal: 'Rs. 409.95',
        discount: '-Rs. 5.00',
        discountCode: 'ORDER5 (-Rs. 5.00)',
        shipping: 'Free',
        shippingOriginal: 'Rs. 10.00',
        shippingDiscountCode: 'FREESHIPPING (-Rs. 10.00)',
        taxes: 'Rs. 0.00',
        total: 'Rs. 404.95 INR',
        savings: 'Rs. 20.00',
        ...options,
    };
    return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      ${totalsRow('Subtotal', o.subtotal)}
      <tr>
        <td colspan="2" style="padding:2px 0 4px;font-size:13px;color:#717171;">Order discount <span style="color:#717171;">${o.discountCode}</span></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#333333;">Order discount</td>
        <td align="right" style="padding:4px 0;font-size:14px;color:#333333;">${o.discount}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:2px 0 4px;font-size:13px;color:#717171;">Shipping <span style="color:#717171;">${o.shippingDiscountCode}</span></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#333333;">Shipping</td>
        <td align="right" style="padding:4px 0;font-size:14px;color:#333333;">
          ${o.shipping}
          <span style="text-decoration:line-through;color:#717171;margin-left:6px;">${o.shippingOriginal}</span>
        </td>
      </tr>
      ${totalsRow('Taxes', o.taxes)}
      ${totalsRow('Total', o.total, true)}
      <tr>
        <td colspan="2" style="padding:8px 0 0;font-size:13px;color:#717171;">You saved ${o.savings}</td>
      </tr>
    </table>`;
}
function buildReadyForLocalPickupEmailHtml(variables) {
    const orderItemsHtml = variables.order_items_html || buildSamplePickupOrderItemsHtml();
    const orderTotalsHtml = variables.order_totals_html || buildPickupOrderTotalsHtml();
    const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ready for local pickup</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Your order is ready for pickup</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">Bring your confirmation email when you come to collect your order.</p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333333;">Pickup location</p>
              <p style="margin:0 0 8px;font-size:14px;color:#333333;line-height:1.6;">
                {{pickup_location_name}}<br/>
                {{pickup_address_line1}}<br/>
                {{pickup_address_line2}}<br/>
                {{pickup_city}} {{pickup_state}} {{pickup_zip}}
              </p>
              <p style="margin:0 0 24px;font-size:14px;">
                <a href="{{pickup_map_url}}" style="color:#1990c6;text-decoration:none;">Open map &#8599;</a>
              </p>
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
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${orderItemsHtml}
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr>
                  <td width="45%"></td>
                  <td width="55%">
                    ${orderTotalsHtml}
                  </td>
                </tr>
              </table>
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
        store_url: '#',
        pickup_location_name: 'Example Shop',
        pickup_address_line1: '34 Example Street',
        pickup_address_line2: 'Next to example',
        pickup_city: 'Ottawa',
        pickup_state: 'Ontario',
        pickup_zip: 'K1N5TS',
        pickup_map_url: '#',
        ...variables,
    };
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function getReadyForLocalPickupEmailBodyTemplate() {
    return buildReadyForLocalPickupEmailHtml({
        store_name: '{{store_name}}',
        order_number: '{{order_number}}',
        view_order_url: '{{view_order_url}}',
        store_url: '{{store_url}}',
        pickup_location_name: '{{pickup_location_name}}',
        pickup_address_line1: '{{pickup_address_line1}}',
        pickup_address_line2: '{{pickup_address_line2}}',
        pickup_city: '{{pickup_city}}',
        pickup_state: '{{pickup_state}}',
        pickup_zip: '{{pickup_zip}}',
        pickup_map_url: '{{pickup_map_url}}',
    });
}
exports.READY_FOR_LOCAL_PICKUP_EMAIL_BODY = getReadyForLocalPickupEmailBodyTemplate();
