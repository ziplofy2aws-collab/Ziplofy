import mongoose, { Document, Model, Schema } from 'mongoose';

export type CheckoutContactMethod = 'phone_or_email' | 'email';
export type CheckoutEmailRegionMode = 'ziplofy_recommended' | 'custom';

export interface ICheckoutSettings extends Document {
  storeId: mongoose.Types.ObjectId;
  contactMethod: CheckoutContactMethod;
  orderTracking: {
    enabled: boolean;
  };
  requireSignIn: boolean;
  marketing: {
    email: {
      enabled: boolean;
      regionMode: CheckoutEmailRegionMode;
    };
    sms: {
      enabled: boolean;
    };
  };
  tipping: {
    enabled: boolean;
    presets: number[];
    hideUntilSelected: boolean;
  };
  checkoutLanguage: string;
  addressCollection: {
    useShippingAsBilling: boolean;
  };
  addToCartLimit: {
    enabled: boolean;
    limit: number | null;
    useRecommended: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const checkoutSettingsSchema = new Schema<ICheckoutSettings>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    contactMethod: {
      type: String,
      enum: ['phone_or_email', 'email'],
      default: 'phone_or_email',
    },
    orderTracking: {
      enabled: { type: Boolean, default: true },
    },
    requireSignIn: { type: Boolean, default: false },
    marketing: {
      email: {
        enabled: { type: Boolean, default: true },
        regionMode: {
          type: String,
          enum: ['ziplofy_recommended', 'custom'],
          default: 'ziplofy_recommended',
        },
      },
      sms: {
        enabled: { type: Boolean, default: false },
      },
    },
    tipping: {
      enabled: { type: Boolean, default: false },
      presets: {
        type: [Number],
        default: [10, 15, 20],
        validate: {
          validator: (value: number[]) => Array.isArray(value) && value.every((num) => num >= 0),
          message: 'Tipping presets must be non-negative numbers.',
        },
      },
      hideUntilSelected: { type: Boolean, default: false },
    },
    checkoutLanguage: { type: String, default: 'English' },
    addressCollection: {
      useShippingAsBilling: { type: Boolean, default: true },
    },
    addToCartLimit: {
      enabled: { type: Boolean, default: false },
      limit: {
        type: Number,
        min: [1, 'Add-to-cart limit must be at least 1.'],
        default: null,
      },
      useRecommended: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

checkoutSettingsSchema.index({ storeId: 1 }, { unique: true });

export const CheckoutSettings: Model<ICheckoutSettings> =
  mongoose.models.CheckoutSettings || mongoose.model<ICheckoutSettings>('CheckoutSettings', checkoutSettingsSchema);
