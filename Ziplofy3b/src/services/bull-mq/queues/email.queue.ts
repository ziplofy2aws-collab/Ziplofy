// Redis/BullMQ temporarily disabled for local development.
// Keep API surface intact so callers do not crash.
export const EMAIL_QUEUE = 'email_queue';

export async function enqueueEmailAddress(to: string, subject?: string, html?: string, text?: string) {
  console.log('[email.queue] Redis disabled, skipping enqueue', {
    to,
    subject: subject || 'Notification from Ziplofy',
    hasHtml: Boolean(html),
    hasText: Boolean(text),
  });
  return { skipped: true };
}

export async function closeEmailQueue(): Promise<void> {
  // no-op while Redis is disabled
}


