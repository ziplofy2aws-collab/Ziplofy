import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICountryTaxOverride {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  countryId: Types.ObjectId;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const countryTaxOverrideSchema = new Schema<ICountryTaxOverride & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: [true, 'Country ID is required'],
      index: true,
    },
    taxRate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

countryTaxOverrideSchema.index({ storeId: 1, countryId: 1 }, { unique: true });

export const CountryTaxOverride: Model<ICountryTaxOverride & Document> =
  mongoose.model<ICountryTaxOverride & Document>('CountryTaxOverride', countryTaxOverrideSchema);

