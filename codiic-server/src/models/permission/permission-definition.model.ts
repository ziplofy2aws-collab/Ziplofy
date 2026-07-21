import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPermissionDefinition {
  _id: mongoose.Types.ObjectId;
  key: string;                 // e.g., "orders.view", "orders.edit.apply_discount"
  name: string;                // Display name
  resource?: string;           // e.g., "orders"
  parentKey?: string | null;   // parent permission key
  implies?: string[];          // keys automatically granted with this
  isLeaf: boolean;             // whether selectable leaf in UI
  order?: number;              // UI sort
  createdAt: Date;
  updatedAt: Date;
}

const permissionDefinitionSchema = new Schema<IPermissionDefinition & Document>(
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
    resource: {
      type: String,
      trim: true,
      default: '',
    },
    parentKey: {
      type: String,
      default: null,
      index: true,
    },
    implies: {
      type: [String],
      default: [],
    },
    isLeaf: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PermissionDefinition: Model<IPermissionDefinition & Document> =
  mongoose.model<IPermissionDefinition & Document>(
    'PermissionDefinition',
    permissionDefinitionSchema
  );


