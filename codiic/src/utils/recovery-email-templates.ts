export type RecoveryEmailTemplateId = 'custom' | 'friendly-nudge';

/** Temporary: customer emails are not real yet — all recovery sends go here (backend mirrors this). */
export const RECOVERY_EMAIL_TEST_RECIPIENT = 'developer200419@gmail.com';

export const RECOVERY_EMAIL_TEMPLATE_OPTIONS: Array<{
  id: RecoveryEmailTemplateId;
  label: string;
}> = [
  { id: 'custom', label: 'Classic recovery' },
  { id: 'friendly-nudge', label: 'Friendly reminder' },
];

export type WrapCartRecoveryEmailOptions = {
  storeName: string;
  customerFirstName?: string;
  cartLink?: string;
};

const sanitizeName = (name?: string): string => {
  const safe = (name || 'there').trim();
  return safe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const sanitizeStoreName = (name?: string): string => sanitizeName(name || 'Your Store');

function buildInnerClassicRecovery(name: string): string {
  return `
<h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.3px;">Hi ${name},</h2>
<p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 16px; line-height: 1.65;">We noticed you left something behind in your cart. Your selected items are still saved and ready whenever you are.</p>
<p style="margin: 0 0 8px 0; color: #3f3f46; font-size: 16px; line-height: 1.65;">Pick up where you left off and complete your order in just a few clicks.</p>
`.trim();
}

function buildInnerFriendlyReminder(name: string): string {
  return `
<h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.3px;">Hi ${name},</h2>
<p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 16px; line-height: 1.65;">Just a quick note — your cart is still waiting for you.</p>
<p style="margin: 0 0 8px 0; color: #3f3f46; font-size: 16px; line-height: 1.65;">We saved your items so you can checkout smoothly when you're ready. If you had any questions, our team is happy to help.</p>
`.trim();
}

export function buildRecoveryEmailTemplate(
  templateId: string,
  firstName?: string,
  storeName?: string
): { subject: string; bodyHtml: string } {
  const name = sanitizeName(firstName);
  const store = sanitizeStoreName(storeName);

  if (templateId === 'friendly-nudge') {
    return {
      subject: `${firstName?.trim() || 'Hey'}, your cart is still saved at ${store}`,
      bodyHtml: buildInnerFriendlyReminder(name),
    };
  }

  return {
    subject: `Complete your order at ${store}`,
    bodyHtml: buildInnerClassicRecovery(name),
  };
}

/** Wraps editor/template body in a store-branded HTML email layout. */
export function wrapCartRecoveryEmailHtml(
  innerHtml: string,
  options: WrapCartRecoveryEmailOptions
): string {
  const trimmed = innerHtml.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return trimmed;
  }

  const store = sanitizeStoreName(options.storeName);
  const cartLink = options.cartLink?.trim() || '#';
  const year = new Date().getFullYear();
  const preheader = `Your cart at ${store} is still saved. Complete checkout when you're ready.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${store}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 28px 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #a1a1aa; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">From your store</p>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.4px;">${store}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              ${trimmed}
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 8px 0;">
                <tr>
                  <td style="border-radius: 8px; background-color: #18181b;">
                    <a href="${cartLink}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.01em;">Return to your cart</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${cartLink}" style="color: #2563eb; word-break: break-all;">${cartLink}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #71717a; font-size: 13px;">Thank you for shopping with ${store}.</p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">© ${year} ${store}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
