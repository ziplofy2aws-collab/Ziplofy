"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_INVOICE_EMAIL_BODY = exports.ORDER_INVOICE_EMAIL_SUBJECT = void 0;
exports.buildSampleInvoiceOrderItemsHtml = buildSampleInvoiceOrderItemsHtml;
exports.buildInvoiceOrderTotalsHtml = buildInvoiceOrderTotalsHtml;
exports.buildOrderInvoiceEmailHtml = buildOrderInvoiceEmailHtml;
exports.getOrderInvoiceEmailBodyTemplate = getOrderInvoiceEmailBodyTemplate;
const order_confirmation_email_template_1 = require("./order-confirmation-email.template");
exports.ORDER_INVOICE_EMAIL_SUBJECT = 'Invoice #{{order_number}}';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
function lineItemRow(productName, quantity, price, subtitle, discountNote, compareAtPrice, indent = false) {
    const priceCell = compareAtPrice
        ? `<span style="text-decoration:line-through;color:#717171;margin-right:6px;">${compareAtPrice}</span>${price}`
        : price;
    return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60" valign="top" style="padding-right:16px;${indent ? 'padding-left:24px;' : ''}">
              ${indent ? '' : `<img src="${PLACEHOLDER_IMAGE}" alt="" width="60" height="60" style="display:block;border-radius:4px;border:1px solid #e5e5e5;" />`}
            </td>
            <td valign="top" style="font-size:14px;color:#333333;line-height:1.5;${indent ? 'padding-left:8px;border-left:2px solid #e5e5e5;' : ''}">
              ${productName}${quantity > 0 ? ` &times; ${quantity}` : ''}
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
function sectionHeading(title) {
    return `
    <tr>
      <td style="padding:24px 0 8px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#333333;">${title}</p>
      </td>
    </tr>`;
}
function totalsRow(label, value, bold = false) {
    return `
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#333333;${bold ? 'font-weight:600;padding-top:12px;font-size:16px;' : ''}">${label}</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#333333;${bold ? 'font-weight:600;padding-top:12px;font-size:16px;' : ''}">${value}</td>
    </tr>`;
}
function buildSampleInvoiceOrderItemsHtml() {
    return [
        sectionHeading('Order summary'),
        lineItemRow('Holiday bundle', 1, 'Rs. 274.98'),
        lineItemRow('Mid-century lounger', 0, 'Rs. 154.99', undefined, 'PROD5 (- Rs. 5.00)', 'Rs. 159.99', true),
        lineItemRow('Coffee table', 0, 'Rs. 119.99', undefined, undefined, undefined, true),
        sectionHeading('Shipping items'),
        lineItemRow('Aviator sunglasses', 1, 'Rs. 89.99'),
        lineItemRow('Lens Protection Plan (2 Year)', 1, 'Rs. 19.99', 'For: Aviator sunglasses'),
        lineItemRow('Premium Leather Case', 1, 'Rs. 24.99', 'For: Aviator sunglasses'),
        sectionHeading('Pickup in store items'),
        lineItemRow('Mid-century lounger', 1, 'Rs. 154.99', undefined, 'PROD5 (- Rs. 5.00)', 'Rs. 159.99'),
        lineItemRow('Coffee table', 1, 'Rs. 119.99', 'Part of: Holiday bundle'),
    ].join('');
}
function buildInvoiceOrderTotalsHtml(options) {
    const o = {
        subtotal: 'Rs. 409.95',
        discount: '-Rs. 5.00',
        discountCode: 'ORDER5 (-Rs. 5.00)',
        shipping: 'Free',
        shippingOriginal: 'Rs. 10.00',
        shippingDiscountCode: 'FREESHIPPING (-Rs. 10.00)',
        taxes: 'Rs. 0.00',
        amountToPay: 'Rs. 404.95 INR',
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
      ${totalsRow('Estimated taxes', o.taxes)}
      ${totalsRow('Amount to pay', o.amountToPay, true)}
    </table>`;
}
function replaceVariables(template, variables) {
    const merged = {
        store_name: 'My Store',
        order_number: '9999',
        amount_due: 'Rs. 404.95',
        pay_now_url: '#',
        store_url: '#',
        ...variables,
    };
    let html = template;
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function buildOrderInvoiceEmailHtml(variables) {
    const orderItemsHtml = variables.order_items_html || buildSampleInvoiceOrderItemsHtml();
    const orderTotalsHtml = variables.order_totals_html || buildInvoiceOrderTotalsHtml();
    const customerInfoHtml = variables.customer_info_html || (0, order_confirmation_email_template_1.buildCustomerInfoHtml)();
    return replaceVariables(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order invoice</title>
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
                  <td align="right" style="font-size:12px;color:#717171;letter-spacing:0.04em;text-transform:uppercase;">INVOICE #{{order_number}}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Payment of {{amount_due}} is due</h1>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td style="border-radius:4px;background-color:#1990c6;">
                    <a href="{{pay_now_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">Pay now</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${orderItemsHtml}</table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr><td width="45%"></td><td width="55%">${orderTotalsHtml}</td></tr>
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
</html>`, variables);
}
function getOrderInvoiceEmailBodyTemplate() {
    return buildOrderInvoiceEmailHtml({
        store_name: '{{store_name}}',
        order_number: '{{order_number}}',
        amount_due: '{{amount_due}}',
        pay_now_url: '{{pay_now_url}}',
        store_url: '{{store_url}}',
    });
}
exports.ORDER_INVOICE_EMAIL_BODY = getOrderInvoiceEmailBodyTemplate();
