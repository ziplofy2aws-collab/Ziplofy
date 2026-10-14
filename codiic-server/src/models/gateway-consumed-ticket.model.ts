import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGatewayConsumedTicket {
  jti: string;
  productUserId: string;
  usedAt: Date;
}

const schema = new Schema<IGatewayConsumedTicket & Document>(
  {
    jti: { type: String, required: true, unique: true, index: true },
    productUserId: { type: String, required: true },
    usedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'gateway_consumed_tickets',
  }
);

schema.index({ usedAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export const GatewayConsumedTicket: Model<IGatewayConsumedTicket & Document> =
  (mongoose.models.GatewayConsumedTicket as Model<IGatewayConsumedTicket & Document>) ||
  mongoose.model<IGatewayConsumedTicket & Document>('GatewayConsumedTicket', schema);
