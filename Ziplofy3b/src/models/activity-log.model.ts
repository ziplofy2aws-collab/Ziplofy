import mongoose, { Document, Schema } from 'mongoose';

export type ActivityAction =
  | 'theme_upload'
  | 'theme_update'
  | 'theme_delete'
  | 'theme_install'
  | 'custom_theme_upload'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'export'
  | 'role_update'
  | 'permission_update';

export interface IActivityLog extends Document {
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  performedByEmail: string;
  action: ActivityAction | string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  summary: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
    performedByEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    entityName: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({ performedBy: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ entityType: 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
