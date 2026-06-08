"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_QUEUE = void 0;
exports.enqueueEmailAddress = enqueueEmailAddress;
exports.closeEmailQueue = closeEmailQueue;
// Redis/BullMQ temporarily disabled for local development.
// Keep API surface intact so callers do not crash.
exports.EMAIL_QUEUE = 'email_queue';
async function enqueueEmailAddress(to, subject, html, text) {
    console.log('[email.queue] Redis disabled, skipping enqueue', {
        to,
        subject: subject || 'Notification from Ziplofy',
        hasHtml: Boolean(html),
        hasText: Boolean(text),
    });
    return { skipped: true };
}
async function closeEmailQueue() {
    // no-op while Redis is disabled
}
