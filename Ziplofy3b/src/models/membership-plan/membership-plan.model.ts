import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMembershipPlanFeature {
  name: string;
  included: boolean;
}

export interface IMembershipPlan {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: IMembershipPlanFeature[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanFeatureSchema = new Schema<IMembershipPlanFeature>(
  {
    name: {
      type: String,
      required: [true, "Feature name is required"],
      trim: true,
      maxLength: [200, "Feature name cannot exceed 200 characters"],
    },
    included: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const membershipPlanSchema = new Schema<IMembershipPlan & Document>(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      maxLength: [100, "Plan name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Plan description is required"],
      trim: true,
      maxLength: [500, "Plan description cannot exceed 500 characters"],
    },
    priceMonthly: {
      type: Number,
      required: [true, "Monthly price is required"],
      min: [0, "Monthly price cannot be negative"],
    },
    priceYearly: {
      type: Number,
      required: [true, "Yearly price is required"],
      min: [0, "Yearly price cannot be negative"],
    },
    features: {
      type: [membershipPlanFeatureSchema],
      default: [],
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

membershipPlanSchema.index({ isActive: 1, sortOrder: 1 });

export const MembershipPlan: Model<IMembershipPlan & Document> =
  mongoose.model<IMembershipPlan & Document>("MembershipPlan", membershipPlanSchema);
