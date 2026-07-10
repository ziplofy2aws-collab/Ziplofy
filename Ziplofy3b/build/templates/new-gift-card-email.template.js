"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEW_GIFT_CARD_EMAIL_BODY = exports.NEW_GIFT_CARD_EMAIL_SUBJECT = void 0;
exports.buildNewGiftCardEmailHtml = buildNewGiftCardEmailHtml;
exports.getNewGiftCardEmailBodyTemplate = getNewGiftCardEmailBodyTemplate;
exports.NEW_GIFT_CARD_EMAIL_SUBJECT = '{{store_name}} {{gift_card_amount}} gift card';
const GIFT_CARD_GRAPHIC = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="Gift card">
  <rect width="320" height="200" rx="12" fill="#d4a853"/>
  <rect x="148" width="24" height="200" fill="#c0392b"/>
  <ellipse cx="160" cy="100" rx="36" ry="28" fill="#c0392b"/>
  <ellipse cx="160" cy="88" rx="22" ry="18" fill="#e74c3c"/>
  <path d="M124 88c0-20 16-32 36-32s36 12 36 32c0 10-8 18-18 22l-18 8-18-8c-10-4-18-12-18-22z" fill="#c0392b"/>
</svg>`;
function replaceVariables(template, variables) {
    const merged = {
        store_name: 'My Store',
        gift_card_amount: 'Rs. 100',
        gift_card_amount_formatted: 'Rs. 100.00 INR',
        gift_card_code: 'A1B2 3C4D 5E6F 7G8H',
        store_url: '#',
        gift_card_balance_url: '#',
        recipient_name: 'Jane Doe',
        customer_name: 'John Doe',
        ...variables,
    };
    let html = template;
    for (const [key, value] of Object.entries(merged)) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return html.trim();
}
function buildNewGiftCardEmailHtml(variables) {
    return replaceVariables(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New gift card</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f6f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e5e5;">
          <tr>
            <td style="padding:48px 32px;text-align:center;">
              <p style="margin:0 0 32px;font-size:32px;font-weight:600;color:#333333;line-height:1.2;">{{gift_card_amount_formatted}}</p>
              <div style="margin:0 auto 32px;width:320px;max-width:100%;">
                ${GIFT_CARD_GRAPHIC}
              </div>
              <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#333333;">{{store_name}}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#717171;line-height:1.6;">Use the gift card code online</p>
              <p style="margin:0 0 32px;font-size:28px;font-weight:600;color:#333333;letter-spacing:0.12em;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{gift_card_code}}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 16px;">
                <tr>
                  <td style="border-radius:4px;background-color:#1990c6;">
                    <a href="{{store_url}}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">Visit online store</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;">
                <a href="{{gift_card_balance_url}}" style="color:#1990c6;text-decoration:none;">View gift card balance</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, variables);
}
function getNewGiftCardEmailBodyTemplate() {
    return buildNewGiftCardEmailHtml({
        store_name: '{{store_name}}',
        gift_card_amount: '{{gift_card_amount}}',
        gift_card_amount_formatted: '{{gift_card_amount_formatted}}',
        gift_card_code: '{{gift_card_code}}',
        store_url: '{{store_url}}',
        gift_card_balance_url: '{{gift_card_balance_url}}',
    });
}
exports.NEW_GIFT_CARD_EMAIL_BODY = getNewGiftCardEmailBodyTemplate();
