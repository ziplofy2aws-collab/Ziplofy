import mongoose, { Document, Model, Schema } from "mongoose";

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateStoreCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return code;
}

// Store interface for TypeScript
export interface IStore {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  storeName: string;
  storeDescription: string;
  appliedTheme?: mongoose.Types.ObjectId | null;
  /** JSON theme creator save applied to the live storefront (StoreCustomTheme). */
  appliedCustomThemeId?: mongoose.Types.ObjectId | null;
  storeCode?: string;
  defaultLocation?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  storeName: {
    type: String,
    required: [true, "Store name is required"],
    trim: true,
    maxLength: [100, "Store name cannot exceed 100 characters"],
    minLength: [2, "Store name must be at least 2 characters"],
  },
  storeDescription: {
    type: String,
    required: [true, "Store description is required"],
    trim: true,
    maxLength: [500, "Store description cannot exceed 500 characters"],
    minLength: [10, "Store description must be at least 10 characters"],
  },
  appliedTheme: {
    type: Schema.Types.ObjectId,
    default: null,
    index: true,
  },
  appliedCustomThemeId: {
    type: Schema.Types.ObjectId,
    ref: "StoreCustomTheme",
    default: null,
    index: true,
  },
  storeCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
  },
  defaultLocation: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
}, {
  timestamps: true,
  versionKey: false
});

// Index for better query performance
storeSchema.index({ userId: 1 });
storeSchema.index({ storeName: 1 });
storeSchema.index({ appliedTheme: 1 });
storeSchema.index({ appliedCustomThemeId: 1 });

// Ensure unique store name per user
storeSchema.index({ userId: 1, storeName: 1 }, { unique: true });
storeSchema.index({ storeCode: 1 }, { unique: true, sparse: true });

storeSchema.pre("save", async function (next) {
  if (!this.storeCode) {
    const Model = this.constructor as mongoose.Model<any>;
    let attempts = 0;
    let code = "";
    do {
      code = generateStoreCode();
      const existing = await Model.findOne({ storeCode: code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);
    this.storeCode = code;
  }
  next();
});

export const Store: Model<IStore & Document> = mongoose.model<IStore & Document>("Store", storeSchema);
