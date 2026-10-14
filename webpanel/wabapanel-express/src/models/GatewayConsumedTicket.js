const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    productUserId: { type: String, required: true },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'gateway_consumed_tickets' }
);

schema.index({ usedAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

module.exports = mongoose.model('GatewayConsumedTicket', schema);
