const mongoose = require('mongoose');

const ssoTicketSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    platformUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformUser', required: true },
    destination: { type: String, enum: ['codiic', 'webpanel'], required: true },
    productUserId: { type: String, required: true },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
    collection: 'platform_sso_tickets',
  }
);

ssoTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SsoTicket', ssoTicketSchema);
