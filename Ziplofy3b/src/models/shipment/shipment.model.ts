import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShipment extends Document {
  _id: mongoose.Types.ObjectId;
  transferId: mongoose.Types.ObjectId; // reference to Transfer
  trackingNumber?: string;
  carrier?: string;
  estimatedArrivalDate?: Date;
  shippedDate?: Date; // when the shipment left origin
  receivedDate?: Date; // when destination received it
  status: 'pending' | 'in_transit' | 'delivered' | 'received' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    transferId: {
      type: Schema.Types.ObjectId,
      ref: "Transfer",
      required: true,
      index: true,
    },
    trackingNumber: { type: String, trim: true },
    carrier: { type: String, trim: true },
    estimatedArrivalDate: { type: Date },
    shippedDate: { type: Date, default: Date.now },
    receivedDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'received', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Shipment: Model<IShipment> = mongoose.model<IShipment>(
  "Shipment",
  shipmentSchema
);
