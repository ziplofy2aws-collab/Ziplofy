"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRAFT_ORDER_INVOICE_EMAIL_BODY = exports.DRAFT_ORDER_INVOICE_EMAIL_SUBJECT = void 0;
exports.buildSampleDraftOrderItemsHtml = buildSampleDraftOrderItemsHtml;
exports.buildDraftOrderTotalsHtml = buildDraftOrderTotalsHtml;
exports.buildDraftOrderInvoiceEmailHtml = buildDraftOrderInvoiceEmailHtml;
exports.getDraftOrderInvoiceEmailBodyTemplate = getDraftOrderInvoiceEmailBodyTemplate;
exports.formatDraftOrderCurrency = formatDraftOrderCurrency;
exports.DRAFT_ORDER_INVOICE_EMAIL_SUBJECT = 'Invoice #{{order_number}}';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
function lineItemRow(productName, quantity, variant, price) {
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
              <br/>
              <span style="font-size:13px;color:#717171;">${variant}</span>
            </td>
            <td valign="top" align="right" style="font-size:14px;color:#333333;white-space:nowrap;padding-left:16px;">
              ${price}
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
function buildSampleDraftOrderItemsHtml() {
    return [
        lineItemRow('Example T-Shirt', 9, 'Small', 'Rs. 179.91'),
        lineItemRow('Example T-Shirt', 1, 'Medium', 'Rs. 19.99'),
    ].join('');
}
function buildDraftOrderTotalsHtml(options) {
    const o = {
        subtotal: 'Rs. 472.00',
        discount: '-Rs. 10.00',
        discountCode: 'ABC 123 (-Rs. 10.00)',
        shipping: 'Rs. 4.00',
        duties: 'Rs. 410.00',
        taxes: 'Rs. 500.00',
        totalDueToday: 'Rs. 0.00 INR',
        totalDue: 'Rs. 459.00 INR',
        savings: 'Rs. 484.00',
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
      ${totalsRow('Shipping', o.shipping)}
      ${totalsRow('Duties', o.duties)}
      ${totalsRow('Estimated taxes', o.taxes)}
      ${totalsRow('Total due today', o.totalDueToday, true)}
      ${totalsRow('Total due', o.totalDue, true)}
      <tr>
        <td colspan="2" style="padding:8px 0 0;font-size:13px;color:#717171;">You saved ${o.savings}</td>
      </tr>
    </table>`;
}
function buildDraftOrderInvoiceEmailHtml(variables) {
    const orderItemsHtml = variables.order_items_html || buildSampleDraftOrderItemsHtml();
    const orderTotalsHtml = variables.order_totals_html || buildDraftOrderTotalsHtml();
    const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Draft order invoice</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#333333;line-height:1.3;">Review and confirm to complete your order</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">These items will be reserved for you until {{reservation_deadline}}.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td style="border-radius:4px;background-color:#1990c6;">
                    <a href="{{confirm_order_url}}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">Confirm order</a>
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
        order_number: 'D136',
        reservation_deadline: 'June 26, 2026 at 12:46 am',
        confirm_order_url: '#',
        store_url: '#',
        ...variables,
    };
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function getDraftOrderInvoiceEmailBodyTemplate() {
    return buildDraftOrderInvoiceEmailHtml({
        store_name: '{{store_name}}',
        order_number: '{{order_number}}',
        reservation_deadline: '{{reservation_deadline}}',
        confirm_order_url: '{{confirm_order_url}}',
        store_url: '{{store_url}}',
    });
}
exports.DRAFT_ORDER_INVOICE_EMAIL_BODY = getDraftOrderInvoiceEmailBodyTemplate();
function formatDraftOrderCurrency(amount, currency = 'Rs.') {
    return `${currency} ${Number(amount).toFixed(2)}`;
}
