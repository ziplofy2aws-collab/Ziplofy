const WebpanelStore = require('../models/WebpanelStore');
const Workspace = require('../models/Workspace');
const { resolveStoreInformaticThemeRuntime } = require('./webpanelInformaticThemeRuntime.util');
const { sendInformaticThemeMail } = require('./informaticThemeEmail.util');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STATUS_COPY = {
  confirmed: {
    subject: (ref) => `Booking confirmed — ${ref}`,
    headline: 'Your booking is confirmed',
    body: 'Great news — your trip has been confirmed by our travel team.',
  },
  cancelled: {
    subject: (ref) => `Booking cancelled — ${ref}`,
    headline: 'Your booking was cancelled',
    body: 'Your booking has been cancelled. Please contact us if you have questions.',
  },
  pending: {
    subject: (ref) => `Booking request received — ${ref}`,
    headline: 'Your booking request was received',
    body: 'We have received your booking request and it is pending confirmation from our travel team.',
  },
};

/**
 * Notify the customer when a tour_travel booking changes status.
 * Uses the store's applied-theme SMTP settings; silently no-ops when SMTP is
 * not configured or the booking has no customer email.
 * Returns { sent, reason? }.
 */
async function notifyBookingStatusToCustomer(booking) {
  const email = String(booking?.data?.email || '').trim();
  if (!email) return { sent: false, reason: 'Booking has no customer email' };
  const copy = STATUS_COPY[booking.status];
  if (!copy) return { sent: false, reason: `No notification for status '${booking.status}'` };

  // Records may live under the owner's workspace rather than store.workspace —
  // mirror the resolveStoreRecordsWorkspaceId cascade in reverse.
  let store = await WebpanelStore.findOne({ workspace: booking.workspace })
    .select('_id storeName appliedTheme userId')
    .lean();
  if (!store) {
    const ws = await Workspace.findById(booking.workspace).select('owner').lean();
    if (ws?.owner) {
      store = await WebpanelStore.findOne({ userId: ws.owner })
        .select('_id storeName appliedTheme userId')
        .lean();
    }
  }
  if (!store?.appliedTheme) return { sent: false, reason: 'No applied theme for store' };

  const runtime = await resolveStoreInformaticThemeRuntime(
    String(store._id),
    String(store.appliedTheme)
  ).catch(() => null);
  const themeConfig = runtime?.themeConfig;
  if (!themeConfig) return { sent: false, reason: 'No theme config' };

  const ref = booking.data?.bookingRef || String(booking._id);
  const rows = [
    ['Booking reference', ref],
    booking.data?.packageName || booking.data?.packageId ? ['Package', booking.data?.packageName || ''] : null,
    booking.data?.departureDate ? ['Departure', booking.data.departureDate] : null,
    booking.data?.returnDate ? ['Return', booking.data.returnDate] : null,
    ['Status', copy.headline.replace(/^Your /, '').replace(/ is| was/, '')],
  ].filter(Boolean);
  const adults = Number(booking.data?.adults) || 0;
  const children = Number(booking.data?.children) || 0;
  const infants = Number(booking.data?.infants) || 0;
  if (adults + children + infants > 0) {
    rows.splice(-1, 0, ['Travellers', `${adults} adult(s)${children ? `, ${children} child(ren)` : ''}${infants ? `, ${infants} infant(s)` : ''}`]);
  }

  const html = `
    <h2>${escapeHtml(copy.headline)}</h2>
    <p>Hi ${escapeHtml(booking.data?.customerName || 'traveller')},</p>
    <p>${escapeHtml(copy.body)}</p>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('')}
    </table>
    <p>— ${escapeHtml(store.storeName || 'Your travel team')}</p>
  `;

  return sendInformaticThemeMail(themeConfig, {
    to: email,
    subject: `${copy.subject(ref)} — ${store.storeName || 'Booking'}`,
    html,
  });
}

module.exports = { notifyBookingStatusToCustomer };
