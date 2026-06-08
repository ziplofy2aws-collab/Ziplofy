import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";

// User interface for TypeScript
export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  status: "active" | "inactive" | "suspended";
  lastLogin: Date | null;
  assignedSupportDeveloperId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser & Document>({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxLength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  assignedSupportDeveloperId: {
    type: Schema.Types.ObjectId,
    ref: "SupportDeveloper",
    default: null,
  },
},{timestamps:true,versionKey:false});

// Hash password before saving
userSchema.pre<IUser & Document>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUser & Document> = mongoose.model<IUser & Document>("User", userSchema);
