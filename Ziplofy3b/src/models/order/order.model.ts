import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder {
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  shippingAddressId: mongoose.Types.ObjectId;
  billingAddressId?: mongoose.Types.ObjectId;
  orderDate: Date;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentMethod?: "credit_card" | "paypal" | "cod" | "other";
  paymentStatus: "unpaid" | "paid" | "refunded";
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IOrderDocument = IOrder & Document;


const OrderSchema = new Schema<IOrderDocument>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    shippingAddressId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerAddress",
      required: true,
    },
    billingAddressId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerAddress",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "cod", "other"],
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// Indexes for better query performance
OrderSchema.index({ storeId: 1, orderDate: -1 });
OrderSchema.index({ customerId: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

export const Order: Model<IOrderDocument> = mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);
