"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_CONFIRMATION_EMAIL_BODY = exports.ORDER_CONFIRMATION_EMAIL_SUBJECT = void 0;
exports.buildSampleOrderItemsHtml = buildSampleOrderItemsHtml;
exports.buildOrderTotalsHtml = buildOrderTotalsHtml;
exports.buildSimpleOrderTotalsHtml = buildSimpleOrderTotalsHtml;
exports.buildCustomerInfoHtml = buildCustomerInfoHtml;
exports.buildOrderConfirmationEmailHtml = buildOrderConfirmationEmailHtml;
exports.getOrderConfirmationEmailBodyTemplate = getOrderConfirmationEmailBodyTemplate;
exports.formatOrderCurrency = formatOrderCurrency;
exports.ORDER_CONFIRMATION_EMAIL_SUBJECT = 'Order #{{order_number}} confirmed';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
function lineItemRow(productName, quantity, price) {
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
            </td>
            <td valign="top" align="right" style="font-size:14px;color:#333333;white-space:nowrap;padding-left:16px;">
              ${price}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}
function fulfillmentGroup(title, subtitle, items) {
    return `
    <tr>
      <td style="padding:24px 0 8px;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#333333;">${title}</p>
        <p style="margin:0;font-size:13px;color:#717171;line-height:1.5;">${subtitle}</p>
      </td>
    </tr>
    ${items}`;
}
function totalsRow(label, value, bold = false) {
    return `
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#333333;${bold ? 'font-weight:600;padding-top:12px;' : ''}">${label}</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#333333;${bold ? 'font-weight:600;padding-top:12px;' : ''}">${value}</td>
    </tr>`;
}
function addressBlock(label, lines) {
    return `
    <td valign="top" width="50%" style="padding-right:12px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333333;">${label}</p>
      <p style="margin:0;font-size:14px;color:#333333;line-height:1.6;">
        ${lines.join('<br/>')}
      </p>
    </td>`;
}
function buildSampleOrderItemsHtml() {
    return [
        lineItemRow('E-book: Fitness Guide', 1, 'Rs. 12.99'),
        fulfillmentGroup('Shipping items', 'Estimated delivery: <strong>Standard &middot; Friday, Jun 26&ndash;Sunday, Jun 28</strong>', [
            lineItemRow('Running shoes', 1, 'Rs. 89.99'),
            lineItemRow('Yoga mat', 1, 'Rs. 29.99'),
        ].join('')),
        fulfillmentGroup('Shipping items', 'Estimated delivery: <strong>Standard &middot; Saturday, Jun 27&ndash;Monday, Jun 29</strong>', lineItemRow('Resistance bands', 1, 'Rs. 19.99')),
        fulfillmentGroup('Pickup in store items', 'Estimated delivery &middot; <strong>Wednesday, Jun 24&ndash;Thursday, Jun 25</strong><br/>You&rsquo;ll receive an email when your order is ready for pickup.', lineItemRow('Protein powder', 1, 'Rs. 34.99')),
        fulfillmentGroup('Shipping not required items', '', lineItemRow('Meditation app subscription', 1, 'Rs. 4.99')),
    ].join('');
}
function buildOrderTotalsHtml(options) {
    const o = {
        subtotal: 'Rs. 387.91',
        discount: '-Rs. 5.00',
        shipping: 'Rs. 25.00',
        pickup: 'Rs. 0.00',
        duties: 'Rs. 0.00',
        taxes: 'Rs. 31.44',
        total: 'Rs. 439.35 INR',
        savings: 'Rs. 20.00',
        paidToday: 'Rs. 422.91 INR',
        paymentMethod: 'Visa (ending in 4242)',
        ...options,
    };
    return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      ${totalsRow('Subtotal', o.subtotal)}
      <tr>
        <td colspan="2" style="padding:4px 0;font-size:13px;color:#717171;">Order discount <span style="color:#717171;">ORDER5 (-Rs. 5.00)</span></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#333333;">Order discount</td>
        <td align="right" style="padding:4px 0;font-size:14px;color:#333333;">${o.discount}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:2px 0 4px;font-size:13px;color:#717171;">Shipping <span style="color:#717171;">FREESHIPPING (-Rs. 10.00)</span></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#333333;">Shipping</td>
        <td align="right" style="padding:4px 0;font-size:14px;color:#333333;">${o.shipping}</td>
      </tr>
      ${totalsRow('Pickup', o.pickup)}
      ${totalsRow('Duties', o.duties)}
      ${totalsRow('Taxes', o.taxes)}
      ${totalsRow('Total', o.total, true)}
      <tr>
        <td colspan="2" style="padding:4px 0 8px;font-size:13px;color:#717171;">You saved ${o.savings}</td>
      </tr>
      ${totalsRow('Total paid today', o.paidToday, true)}
      <tr>
        <td style="padding:8px 0 4px;font-size:14px;color:#333333;">${o.paymentMethod}</td>
        <td align="right" style="padding:8px 0 4px;font-size:14px;color:#333333;">${o.paidToday.replace(' INR', '')}</td>
      </tr>
    </table>`;
}
function buildSimpleOrderTotalsHtml(options) {
    return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      ${totalsRow('Subtotal', options.subtotal)}
      ${totalsRow('Shipping', options.shipping)}
      ${totalsRow('Taxes', options.taxes)}
      ${totalsRow('Total', options.total, true)}
      ${options.paymentMethod
        ? `<tr>
        <td style="padding:8px 0 4px;font-size:14px;color:#333333;">${options.paymentMethod}</td>
        <td align="right" style="padding:8px 0 4px;font-size:14px;color:#333333;">${options.total.replace(' INR', '')}</td>
      </tr>`
        : ''}
    </table>`;
}
function buildCustomerInfoHtml(options) {
    const shipping = options?.shippingLines ?? [
        'Steve Shipper',
        'Shipping Company',
        '123 Shipping Street',
        'Shippington KY 40003',
        'United States',
    ];
    const billing = options?.billingLines ?? [
        'Bob Biller',
        'My Company',
        '123 Billing Street',
        'Billtown KY K2P0B0',
        'United States',
    ];
    return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        ${addressBlock('Shipping address', shipping)}
        ${addressBlock('Billing address', billing)}
      </tr>
    </table>`;
}
function buildOrderConfirmationEmailHtml(variables) {
    const orderItemsHtml = variables.order_items_html || buildSampleOrderItemsHtml();
    const orderTotalsHtml = variables.order_totals_html || buildOrderTotalsHtml();
    const customerInfoHtml = variables.customer_info_html || buildCustomerInfoHtml();
    const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order confirmation</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Thank you for your order!</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">You&rsquo;ll receive an email when your order is ready for pickup.</p>
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
          <tr>
            <td style="padding:32px;border-top:1px solid #e5e5e5;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#333333;">Customer information</h2>
              ${customerInfoHtml}
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
        ...variables,
    };
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function getOrderConfirmationEmailBodyTemplate() {
    return buildOrderConfirmationEmailHtml({
        store_name: '{{store_name}}',
        order_number: '{{order_number}}',
        view_order_url: '{{view_order_url}}',
        store_url: '{{store_url}}',
    });
}
exports.ORDER_CONFIRMATION_EMAIL_BODY = getOrderConfirmationEmailBodyTemplate();
function formatOrderCurrency(amount, currency = 'Rs.') {
    return `${currency} ${Number(amount).toFixed(2)}`;
}
