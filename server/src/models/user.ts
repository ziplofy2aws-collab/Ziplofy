import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  hashedPassword?: string;
  provider: 'local' | 'google';
  googleId?: string;
  role: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Pending';
  totalPurchases: number;
  assignedSupportDeveloperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser & Document> = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, required: true, lowercase: true, index: true },
  hashedPassword: { type: String },
  provider: { type: String, enum: ['local', 'google'] as const, default: 'local' },
  googleId: { type: String },
  role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'] as const,
    default: 'Active'
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  assignedSupportDeveloperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportDeveloper',
    default: null
  }
}, { timestamps: true });

export const User: Model<IUser & Document> = mongoose.model<IUser & Document>('User', userSchema);
