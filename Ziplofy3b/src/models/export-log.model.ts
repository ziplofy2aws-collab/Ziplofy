import mongoose, { Document, Schema } from 'mongoose';

export interface IExportLog extends Document {
  exportedBy: mongoose.Types.ObjectId;
  exportedByName: string;
  exportedByEmail: string;
  page: string;
  csvContent: string;
  fileName: string;
  createdAt: Date;
}

const ExportLogSchema = new Schema<IExportLog>({
  exportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exportedByName: {
    type: String,
    required: true,
  },
  exportedByEmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  page: {
    type: String,
    required: true,
  },
  csvContent: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

ExportLogSchema.index({ exportedBy: 1, createdAt: -1 });
ExportLogSchema.index({ createdAt: -1 });
ExportLogSchema.index({ page: 1 });

export const ExportLog = mongoose.model<IExportLog>('ExportLog', ExportLogSchema);
