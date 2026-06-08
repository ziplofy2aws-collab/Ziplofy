import mongoose, { Document, Schema } from "mongoose";

export interface IClient extends Document {
  name: string;
  email: string;
  totalPurchases: number;
  status: "Active" | "Inactive" | "Pending";
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: [true, "Client name is required"],
    trim: true,
    maxLength: [100, "Client name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  totalPurchases: {
    type: Number,
    default: 0,
    min: [0, "Total purchases cannot be negative"],
  },
  status: {
    type: String,
    enum: {
      values: ["Active", "Inactive", "Pending"],
      message: "Status must be Active, Inactive, or Pending",
    },
    default: "Active",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
clientSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Client = mongoose.model<IClient>("Client", clientSchema);
