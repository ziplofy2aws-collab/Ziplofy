import mongoose, { Document, Model, Schema } from 'mongoose';

// Enumerates platform-supported triggers
export enum TriggerKey {
  ADD_TO_CART = 'add_to_cart',
}

export interface IAutomationFlow extends Document {
  storeId: string; // which store this flow belongs to
  name: string; // e.g. "Send email when cart > 3 items"
  description?: string;

  triggerId: mongoose.Types.ObjectId; // reference to Trigger
  triggerKey: TriggerKey; // convenience field constrained to platform triggers

  isActive: boolean; // enable/disable flow

  flowData: any; // raw React Flow JSON (nodes, edges, positions, customData, etc.)
  lastExecutedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AutomationFlowSchema = new Schema<IAutomationFlow>(
  {
    storeId: {
      type: String,
      required: true,
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
    triggerId: {
      type: Schema.Types.ObjectId,
      ref: 'Trigger',
      required: true,
    },
    triggerKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: Object.values(TriggerKey),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    flowData: {
      type: Schema.Types.Mixed, // React Flow JSON object
      required: true,
    },
    lastExecutedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// Optional compound index to quickly find flows by store and trigger
AutomationFlowSchema.index({ storeId: 1, triggerKey: 1 });

export const AutomationFlow: Model<IAutomationFlow> =
  mongoose.model<IAutomationFlow>('AutomationFlow', AutomationFlowSchema);


