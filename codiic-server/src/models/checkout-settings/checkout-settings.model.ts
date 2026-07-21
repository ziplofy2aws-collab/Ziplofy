import mongoose, { Document, Model, Schema } from 'mongoose';

export type CheckoutContactMethod = 'phone_or_email' | 'email';
export type CheckoutEmailRegionMode = 'codiic_recommended' | 'custom';

export function normalizeCheckoutEmailRegionMode(
  mode?: string | null
): CheckoutEmailRegionMode {
  if (mode === 'custom') return 'custom';
  return 'codiic_recommended';
}
export type CheckoutFullNameOption = 'last_name' | 'first_last';
export type CheckoutFieldRequirementOption = 'dont_include' | 'optional' | 'required';
export const RECOMMENDED_ADD_TO_CART_LIMIT = 50;

export interface ICheckoutCustomerInformation {
  fullNameOption: CheckoutFullNameOption;
  companyNameOption: CheckoutFieldRequirementOption;
  addressLine2Option: CheckoutFieldRequirementOption;
  shippingPhoneOption: CheckoutFieldRequirementOption;
}

export const DEFAULT_CHECKOUT_CUSTOMER_INFORMATION: ICheckoutCustomerInformation = {
  fullNameOption: 'last_name',
  companyNameOption: 'dont_include',
  addressLine2Option: 'optional',
  shippingPhoneOption: 'dont_include',
};

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
  customerInformation: ICheckoutCustomerInformation;
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
          enum: ['codiic_recommended', 'custom', 'ziplofy_recommended'],
          default: 'codiic_recommended',
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
    customerInformation: {
      fullNameOption: {
        type: String,
        enum: ['last_name', 'first_last'],
        default: DEFAULT_CHECKOUT_CUSTOMER_INFORMATION.fullNameOption,
      },
      companyNameOption: {
        type: String,
        enum: ['dont_include', 'optional', 'required'],
        default: DEFAULT_CHECKOUT_CUSTOMER_INFORMATION.companyNameOption,
      },
      addressLine2Option: {
        type: String,
        enum: ['dont_include', 'optional', 'required'],
        default: DEFAULT_CHECKOUT_CUSTOMER_INFORMATION.addressLine2Option,
      },
      shippingPhoneOption: {
        type: String,
        enum: ['dont_include', 'optional', 'required'],
        default: DEFAULT_CHECKOUT_CUSTOMER_INFORMATION.shippingPhoneOption,
      },
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
