"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderConfirmationEmailBody = exports.sendEmail = exports.UrlType = void 0;
const nodemailer_config_1 = __importDefault(require("../config/nodemailer.config"));
var UrlType;
(function (UrlType) {
    UrlType["VIEW_REQUIREMENTS_FORM"] = "viewRequirementsForm";
})(UrlType || (exports.UrlType = UrlType = {}));
const sendEmail = async (options) => {
    const from = process.env.EMAIL_ADDRESS?.trim();
    if (!from) {
        throw new Error('EMAIL_ADDRESS is not configured. Check your .env file.');
    }
    let emailBody = options.body;
    if (options.url) {
        // Add the URL to the body, with a clickable link
        emailBody += `<br/><br/>Link: <a href="${options.url}" target="_blank">${options.url}</a>`;
    }
    const mailOptions = {
        from: `Ziplofy <${from}>`,
        to: options.to,
        subject: options.subject,
        html: emailBody,
    };
    await nodemailer_config_1.default.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
const getOrderConfirmationEmailBody = (params) => {
    const { customerName, orderId, total } = params;
    const formattedTotal = `$${Number(total).toFixed(2)}`;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Ziplofy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Ziplofy</h1>
              <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 14px;">Thank you for your order</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px;">Great news! Your order has been successfully placed.</p>
              
              <!-- Order ID Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
                    <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600; font-family: monospace;">${orderId}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Total</p>
                    <p style="margin: 0; color: #18181b; font-size: 20px; font-weight: 700;">${formattedTotal}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #71717a; font-size: 14px;">We'll send you another email when your order ships. If you have any questions, please don't hesitate to reach out.</p>
              <p style="margin: 0; color: #3f3f46; font-size: 16px;">Thank you for shopping with us!</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">© ${new Date().getFullYear()} Ziplofy. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
exports.getOrderConfirmationEmailBody = getOrderConfirmationEmailBody;
