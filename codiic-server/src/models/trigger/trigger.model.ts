import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITrigger extends Document {
  key: string;         // e.g. "cart_item_added"
  name: string;        // e.g. "Cart Item Added"
  description?: string;
  hasConditions: boolean; // whether this trigger supports conditions
  exposedVariables: {
    path: string;        // e.g. "cart.quantity"
    label: string;       // e.g. "Quantity"
    type: string;        // e.g. "number"
    description?: string;
  } // variables that can be used in conditions
  createdAt: Date;
  updatedAt: Date;
}

const TriggerSchema = new Schema<ITrigger>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    hasConditions: {
      type: Boolean,
      default: false,
    },
    exposedVariables: [
      {
        path: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true }, // 'string' | 'number' | 'boolean'
        description: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Trigger: Model<ITrigger> = mongoose.model<ITrigger>('Trigger', TriggerSchema);
