import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderItem {
  orderId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IOrderItemDocument = IOrderItem & Document;

const OrderItemSchema = new Schema<IOrderItemDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    productVariantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ productVariantId: 1 });

export const OrderItem: Model<IOrderItemDocument> = mongoose.models.OrderItem || mongoose.model<IOrderItemDocument>("OrderItem", OrderItemSchema);

