import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Client (store-owner) user model, merged in from the former standalone `server` auth service.
 *
 * It intentionally maps to the SAME `users` collection used by the admin `User` model so that
 * a single user population is shared across the app. This schema keeps the fields the client
 * email/password + Google sign-up flows rely on (`hashedPassword`, `provider`, `googleId`),
 * which the admin `User` schema does not declare.
 */
export interface ICodiicUser {
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

const codiicUserSchema: Schema<ICodiicUser & Document> = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    hashedPassword: { type: String },
    provider: { type: String, enum: ['local', 'google'] as const, default: 'local' },
    googleId: { type: String },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'] as const,
      default: 'Active',
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    assignedSupportDeveloperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportDeveloper',
      default: null,
    },
  },
  { timestamps: true }
);

// Bind to the shared `users` collection and guard against re-compilation under tsc watch / tests.
export const CodiicUser: Model<ICodiicUser & Document> =
  (mongoose.models.CodiicUser as Model<ICodiicUser & Document>) ||
  mongoose.model<ICodiicUser & Document>('CodiicUser', codiicUserSchema, 'users');
