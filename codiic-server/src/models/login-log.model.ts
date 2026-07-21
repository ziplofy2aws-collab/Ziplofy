import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginLog extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  loginTime: Date;
  ipAddress?: string;
  userAgent?: string;
  loginMethod: 'email' | 'google';
  success: boolean;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoginLogSchema = new Schema<ILoginLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  loginMethod: {
    type: String,
    enum: ['email', 'google'],
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
LoginLogSchema.index({ userId: 1, loginTime: -1 });
LoginLogSchema.index({ email: 1, loginTime: -1 });
LoginLogSchema.index({ loginTime: -1 });

export const LoginLog = mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);
