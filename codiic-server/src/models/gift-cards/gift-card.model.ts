import mongoose, { Schema } from 'mongoose';

export interface IGiftCard {
  _id: string;
  storeId: string;
  code: string;
  initialValue: number;
  expirationDate?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GiftCardSchema = new Schema<IGiftCard>({
  storeId: {
    type: String,
    required: [true, "Store ID is required"],
    trim: true,
  },
  code: {
    type: String,
    required: [true, "Gift card code is required"],
    unique: true,
    trim: true,
    maxLength: [50, "Gift card code cannot exceed 50 characters"],
    minLength: [3, "Gift card code must be at least 3 characters"],
  },
  initialValue: {
    type: Number,
    required: [true, "Initial value is required"],
    min: [0, "Initial value cannot be negative"],
  },
  expirationDate: {
    type: Date,
    validate: {
      validator: function(this: IGiftCard, value: Date) {
        // If expiration date is provided, it should be in the future
        return !value || value > new Date();
      },
      message: "Expiration date must be in the future"
    }
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, "Notes cannot exceed 1000 characters"],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for better performance
GiftCardSchema.index({ storeId: 1 });
GiftCardSchema.index({ code: 1 });
GiftCardSchema.index({ expirationDate: 1 });
GiftCardSchema.index({ isActive: 1 });
GiftCardSchema.index({ createdAt: -1 });

export const GiftCard = mongoose.model<IGiftCard>('GiftCard', GiftCardSchema);
