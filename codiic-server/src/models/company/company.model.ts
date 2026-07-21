import mongoose, { Document, Model, Schema } from "mongoose";

export const COMPANY_PAYMENT_TERMS = [
  "none",
  "due_on_fulfillment",
  "net-7",
  "net-15",
  "net-30",
  "net-45",
  "net-60",
  "net-90",
] as const;
export type CompanyPaymentTerms = (typeof COMPANY_PAYMENT_TERMS)[number];

export const COMPANY_TAX_SETTINGS = ["collect", "collect_unless_exempt", "dont_collect"] as const;
export type CompanyTaxSettings = (typeof COMPANY_TAX_SETTINGS)[number];

export const COMPANY_ORDER_SUBMISSION = ["auto", "draft"] as const;
export type CompanyOrderSubmission = (typeof COMPANY_ORDER_SUBMISSION)[number];

export interface ICompanyAddress {
  country: string;
  firstName: string;
  lastName: string;
  companyAttention?: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  pinCode?: string;
  phone?: string;
}

export interface ICompanyMainContact {
  customerId?: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

/** Single location per company — shipping + optional billing + B2B settings. */
export interface ICompanyLocation {
  externalId?: string;
  shippingAddress?: ICompanyAddress;
  billingSameAsShipping: boolean;
  /** Stored only when billingSameAsShipping is false. */
  billingAddress?: ICompanyAddress;
  paymentTerms: CompanyPaymentTerms;
  allowOneTimeShipAddress: boolean;
  orderSubmission: CompanyOrderSubmission;
  taxId?: string;
  taxSettings: CompanyTaxSettings;
}

export interface ICompany {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  externalId?: string;
  mainContact?: ICompanyMainContact;
  location?: ICompanyLocation;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companyAddressSchema = new Schema<ICompanyAddress>(
  {
    country: { type: String, required: true, trim: true, maxLength: 100 },
    firstName: { type: String, required: true, trim: true, maxLength: 50 },
    lastName: { type: String, required: true, trim: true, maxLength: 50 },
    companyAttention: { type: String, trim: true, maxLength: 100 },
    address: { type: String, required: true, trim: true, maxLength: 200 },
    apartment: { type: String, trim: true, maxLength: 50 },
    city: { type: String, required: true, trim: true, maxLength: 100 },
    state: { type: String, trim: true, maxLength: 100 },
    pinCode: { type: String, trim: true, maxLength: 20 },
    phone: { type: String, trim: true, maxLength: 20 },
  },
  { _id: false }
);

const companyMainContactSchema = new Schema<ICompanyMainContact>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    firstName: { type: String, trim: true, maxLength: 50 },
    lastName: { type: String, trim: true, maxLength: 50 },
    email: { type: String, trim: true, lowercase: true, maxLength: 255 },
    phoneNumber: { type: String, trim: true, maxLength: 20 },
  },
  { _id: false }
);

const companyLocationSchema = new Schema<ICompanyLocation>(
  {
    externalId: { type: String, trim: true, maxLength: 100 },
    shippingAddress: { type: companyAddressSchema, default: undefined },
    billingSameAsShipping: { type: Boolean, default: true },
    billingAddress: { type: companyAddressSchema, default: undefined },
    paymentTerms: {
      type: String,
      enum: COMPANY_PAYMENT_TERMS,
      default: "none",
    },
    allowOneTimeShipAddress: { type: Boolean, default: false },
    orderSubmission: {
      type: String,
      enum: COMPANY_ORDER_SUBMISSION,
      default: "auto",
    },
    taxId: { type: String, trim: true, maxLength: 100 },
    taxSettings: {
      type: String,
      enum: COMPANY_TAX_SETTINGS,
      default: "collect",
    },
  },
  { _id: false }
);

const companySchema = new Schema<ICompany & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxLength: [255, "Company name cannot exceed 255 characters"],
      minLength: [1, "Company name is required"],
    },
    externalId: {
      type: String,
      trim: true,
      maxLength: [100, "Company ID cannot exceed 100 characters"],
    },
    mainContact: {
      type: companyMainContactSchema,
      default: undefined,
    },
    location: {
      type: companyLocationSchema,
      default: undefined,
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

companySchema.index({ storeId: 1, updatedAt: -1 });
companySchema.index(
  { storeId: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalId: { $type: "string", $ne: "" } },
  }
);

export const Company: Model<ICompany & Document> = mongoose.model<ICompany & Document>(
  "Company",
  companySchema
);

/** Resolve billing address for reads — derive from shipping when flagged as same. */
export function resolveCompanyBillingAddress(
  location: ICompanyLocation | undefined
): ICompanyAddress | undefined {
  if (!location) return undefined;
  if (location.billingSameAsShipping) {
    return location.shippingAddress;
  }
  return location.billingAddress;
}
