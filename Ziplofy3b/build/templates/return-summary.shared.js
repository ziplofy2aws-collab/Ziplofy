"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETURN_EMAIL_DEFAULTS = void 0;
exports.buildReturnItemRow = buildReturnItemRow;
exports.buildSampleReturnSummaryHtml = buildSampleReturnSummaryHtml;
exports.replaceReturnEmailVariables = replaceReturnEmailVariables;
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
function buildReturnItemRow(productName, quantity, price, subtitle, discountNote, compareAtPrice) {
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
function buildSampleReturnSummaryHtml() {
    return [
        buildReturnItemRow('Aviator sunglasses', 1, 'Rs. 89.99'),
        buildReturnItemRow('Lens Protection Plan (2 Year)', 1, 'Rs. 19.99', 'For: Aviator sunglasses'),
        buildReturnItemRow('Premium Leather Case', 1, 'Rs. 24.99', 'For: Aviator sunglasses'),
        buildReturnItemRow('Mid-century lounger', 1, 'Rs. 154.99', 'Part of: Holiday bundle', 'PROD5 (- Rs. 5.00)', 'Rs. 159.99'),
        buildReturnItemRow('Coffee table', 1, 'Rs. 119.99', 'Part of: Holiday bundle'),
    ].join('');
}
function replaceReturnEmailVariables(template, variables, defaults) {
    const merged = { ...defaults, ...variables };
    let html = template;
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
exports.RETURN_EMAIL_DEFAULTS = {
    store_name: 'My Store',
    order_number: '9999',
    view_order_url: '#',
    store_url: '#',
    support_email: 'support@example.com',
    return_tracking_url: '#',
    return_label_url: '#',
};
