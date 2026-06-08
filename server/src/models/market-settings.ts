import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMarketSettings extends Document {
  _id: mongoose.Types.ObjectId;
  marketId: Types.ObjectId;
  storeId: Types.ObjectId;

  // 💰 Currency
  currencyId: Types.ObjectId;

  // 🌐 Domain & Language
  domain: string;
  locale: string;
  languageCode: string;
  countryCode: string;
  subfolder: string;
  isPrimary: boolean;

  // 🧾 Taxes & Duties
  salesTaxCollecting: boolean;
  dutiesAndImportTaxCollecting: boolean;
  dutiesAndImportTaxDisplay?: 'line_item' | 'included_in_price';
  taxDisplay: 'dynamic' | 'included' | 'line_item';

  // 🏬 Online Store Theme
  onlineStoreTheme?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const marketSettingsSchema = new Schema<IMarketSettings>({
  // 🏪 Associations
  marketId: { type: Schema.Types.ObjectId, ref: 'Market', required: true, index: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },

  // 💰 Currency
  currencyId: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },

  // 🌐 Domain & Language
  domain: { type: String, required: true },
  locale: { type: String, required: true },
  languageCode: { type: String, required: true },
  countryCode: { type: String, required: true },
  subfolder: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },

  // 🧾 Taxes & Duties
  salesTaxCollecting: { type: Boolean, default: false },
  dutiesAndImportTaxCollecting: { type: Boolean, default: false },
  dutiesAndImportTaxDisplay: {
    type: String,
    enum: ['line_item', 'included_in_price'],
    required: false,
  },
  taxDisplay: {
    type: String,
    enum: ['dynamic', 'included', 'line_item'],
    default: 'dynamic',
    required: true,
  },

  // 🏬 Online Store Theme
  onlineStoreTheme: { type: Schema.Types.ObjectId, ref: 'Theme' },

}, { timestamps: true, versionKey: false });

// Ensure one settings document per market
marketSettingsSchema.index({ marketId: 1 }, { unique: true });

export const MarketSettings: Model<IMarketSettings> = mongoose.model<IMarketSettings>('MarketSettings', marketSettingsSchema);


