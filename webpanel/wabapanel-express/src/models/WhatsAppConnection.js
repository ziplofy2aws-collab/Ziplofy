const mongoose = require('mongoose');

// Per-tenant WhatsApp Cloud API connection record.
// One document per tenant (workspace). `workspace.whatsapp` stays the runtime
// config the rest of the app reads; this record adds the explicit lifecycle
// (connected / pending / disconnected), token health and audit trail.
const whatsAppConnectionSchema = new mongoose.Schema({
  // CODiC customer ID (tenant)
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true, index: true },

  // Meta Business Portfolio ID (the customer's business, not ours)
  businessId: { type: String, default: '' },
  wabaId: { type: String, default: '', index: true },
  phoneNumberId: { type: String, default: '', index: true },
  phoneNumber: { type: String, default: '' },
  displayName: { type: String, default: '' },
  qualityRating: { type: String, default: '' },

  // Authorized token for this tenant's WABA. Never selected by default so it
  // cannot leak into API responses — opt in with .select('+accessToken').
  accessToken: { type: String, default: '', select: false },
  tokenType: { type: String, default: '' },
  scopes: [{ type: String }],
  tokenExpiresAt: { type: Date, default: null }, // null = never expires (system-user token)
  tokenValid: { type: Boolean, default: false },
  lastTokenCheckAt: { type: Date, default: null },
  lastTokenError: { type: String, default: '' },

  connectionMethod: { type: String, enum: ['embedded', 'qr', 'manual', 'coexistence', ''], default: '' },
  connectionStatus: {
    type: String,
    enum: ['connected', 'pending', 'disconnected'],
    default: 'disconnected',
    index: true,
  },

  webhookSubscribed: { type: Boolean, default: false },
  webhookSubscribedAt: { type: Date, default: null },

  connectedAt: { type: Date, default: null },
  disconnectedAt: { type: Date, default: null },
  lastError: { type: String, default: '' },

  // Compact audit trail of status transitions (capped at last 50).
  history: [{
    status: { type: String },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

whatsAppConnectionSchema.methods.pushHistory = function (status, note) {
  this.history.push({ status, note: String(note || '').slice(0, 300) });
  if (this.history.length > 50) this.history = this.history.slice(-50);
};

// Never expose the token when a doc is serialized (extra safety on top of select:false).
whatsAppConnectionSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.accessToken; return ret; },
});

module.exports = mongoose.model('WhatsAppConnection', whatsAppConnectionSchema);
