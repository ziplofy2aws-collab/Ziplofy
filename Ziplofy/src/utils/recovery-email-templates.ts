export type RecoveryEmailTemplateId =
  | 'custom'
  | 'friendly-nudge'
  | 'social-proof'
  | 'free-shipping'
  | 'limited-offer'
  | 'low-stock'
  | 'last-chance';

export const RECOVERY_EMAIL_TEMPLATE_OPTIONS: Array<{
  id: RecoveryEmailTemplateId;
  label: string;
}> = [
  { id: 'custom', label: 'Classic Recovery' },
  { id: 'friendly-nudge', label: 'Friendly Nudge' },
  { id: 'social-proof', label: 'Trending Picks' },
  { id: 'free-shipping', label: 'Free Shipping Push' },
  { id: 'limited-offer', label: 'Limited-Time Offer' },
  { id: 'low-stock', label: 'Low Stock Alert' },
  { id: 'last-chance', label: 'Last Chance Reminder' },
];

const sanitizeName = (name?: string): string => {
  const safe = (name || 'there').trim();
  return safe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export function buildRecoveryEmailTemplate(
  templateId: string,
  firstName?: string
): { subject: string; bodyHtml: string } {
  const name = sanitizeName(firstName);

  if (templateId === 'friendly-nudge') {
    return {
      subject: `${firstName || 'Hey'} - your cart is waiting for you`,
      bodyHtml: `<h2>Hi ${name},</h2><p>You left a few great picks in your cart and we saved them for you.</p><p>Complete your checkout now before your selection changes.</p><p><a href="[Cart Link]"><strong>Return to your cart</strong></a></p><p>See you at checkout,<br/><strong>Your Store Team</strong></p>`,
    };
  }

  if (templateId === 'social-proof') {
    return {
      subject: `${firstName || 'You'} have popular items in your cart`,
      bodyHtml: `<h2>Hi ${name},</h2><p>Great choice. The items in your cart are among our most-loved picks right now.</p><ul><li>Highly rated by recent shoppers</li><li>Frequently bought together</li><li>Often sold out quickly</li></ul><p><a href="[Cart Link]"><strong>Complete your order now</strong></a></p><p>Warmly,<br/><strong>Your Store Team</strong></p>`,
    };
  }

  if (templateId === 'free-shipping') {
    return {
      subject: `Complete your order, ${firstName || 'friend'} - shipping perks inside`,
      bodyHtml: `<h2>Hi ${name},</h2><p>Your cart is still active. Finish your purchase now and enjoy a smoother checkout experience.</p><p>Good news: your order may qualify for a shipping benefit at checkout.</p><p><a href="[Cart Link]"><strong>Continue to checkout</strong></a></p><p>Cheers,<br/><strong>Your Store Team</strong></p>`,
    };
  }

  if (templateId === 'limited-offer') {
    return {
      subject: `A little thank-you offer just for you, ${firstName || 'there'}`,
      bodyHtml: `<h2>Hi ${name},</h2><p>We noticed your cart is still waiting. Use code <strong>SAVE10</strong> at checkout for a limited-time extra value.</p><p style="margin:10px 0;padding:10px 12px;border:1px dashed #9ca3af;border-radius:8px;background:#f9fafb;"><strong>Code:</strong> SAVE10<br/><span style="font-size:12px;color:#6b7280;">Offer valid for a short time.</span></p><p><a href="[Cart Link]"><strong>Apply code and checkout</strong></a></p><p>Thanks,<br/><strong>Your Store Team</strong></p>`,
    };
  }

  if (templateId === 'low-stock') {
    return {
      subject: `${firstName || 'Heads up'} - items in your cart are moving fast`,
      bodyHtml: `<h2>Hi ${name},</h2><p>Quick reminder: some products in your cart may run low soon.</p><p>If you still want them, this is a great moment to complete your purchase.</p><p><a href="[Cart Link]"><strong>Secure your items now</strong></a></p><p>Best,<br/><strong>Your Store Team</strong></p>`,
    };
  }

  if (templateId === 'last-chance') {
    return {
      subject: `Final reminder, ${firstName || 'friend'} - your cart expires soon`,
      bodyHtml: `<h2>Hi ${name},</h2><p>This is a final reminder about your saved cart.</p><p>Complete checkout now so you do not miss out on your selected items.</p><p><a href="[Cart Link]"><strong>Checkout before it expires</strong></a></p><p>We'd love to deliver this to you,<br/><strong>Your Store Team</strong></p>`,
    };
  }

  return {
    subject: `Complete your purchase - ${firstName || 'there'}`,
    bodyHtml: `<h2>Hi ${name},</h2><p>We noticed you left some items in your cart. Don't miss out on these great products.</p><p><a href="[Cart Link]"><strong>Click here to complete your purchase</strong></a></p><p>Best regards,<br/><strong>Your Store Team</strong></p>`,
  };
}
