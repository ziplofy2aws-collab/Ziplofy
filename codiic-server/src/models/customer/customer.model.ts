import mongoose, { Document, Model, Schema } from "mongoose";

// Customer Interface
export interface ICustomer {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  phoneNumber?: string;
  password?: string; // optional storefront auth password
  isVerified?: boolean;
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
  collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  notes?: string;
  tagIds: mongoose.Types.ObjectId[];
  defaultAddress?: mongoose.Types.ObjectId; // Reference to CustomerAddress
  createdAt: Date;
  updatedAt: Date;
}

// Customer Schema
const customerSchema = new Schema<ICustomer & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxLength: [50, "First name cannot exceed 50 characters"],
    minLength: [2, "First name must be at least 2 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxLength: [50, "Last name cannot exceed 50 characters"],
    minLength: [2, "Last name must be at least 2 characters"],
  },
  language: {
    type: String,
    required: [true, "Language is required"],
    trim: true,
    maxLength: [10, "Language code cannot exceed 10 characters"],
    default: "en",
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    maxLength: [100, "Email cannot exceed 100 characters"],
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    maxLength: [20, "Phone number cannot exceed 20 characters"],
  },
  password: {
    type: String,
    required: false,
    trim: true,
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  agreedToMarketingEmails: {
    type: Boolean,
    default: false,
  },
  agreedToSmsMarketing: {
    type: Boolean,
    default: false,
  },
  collectTax: {
    type: String,
    enum: ['collect', 'dont_collect', 'collect_unless_exempt'],
    default: 'collect',
    required: [true, "Tax collection setting is required"],
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, "Notes cannot exceed 1000 characters"],
  },
  tagIds: [{
    type: Schema.Types.ObjectId,
    ref: "CustomerTags",
  }],
  defaultAddress: {
    type: Schema.Types.ObjectId,
    ref: "CustomerAddress",
    required: false,
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
customerSchema.index({ storeId: 1 });
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phoneNumber: 1 });
customerSchema.index({ firstName: 1, lastName: 1 });
customerSchema.index({ tagIds: 1 });
customerSchema.index({ defaultAddress: 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address can be populated client-side using addressId

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate email uniqueness globally
customerSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    const existingCustomer = await Customer.findOne({
      email: this.email,
      _id: { $ne: this._id }
    });
    
    if (existingCustomer) {
      const error = new Error('Email already exists');
      return next(error);
    }
  }
  next();
});

// Export the Customer model
export const Customer: Model<ICustomer & Document> = mongoose.model<ICustomer & Document>("Customer", customerSchema);
