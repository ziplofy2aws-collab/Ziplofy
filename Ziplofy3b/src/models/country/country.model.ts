import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  officialName: string;
  iso2: string;
  iso3: string;
  numericCode: string;
  region?: string;
  subRegion?: string;
  flagEmoji?: string;
  currencyCode?: string;
  currencyId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>(
  {
    name: { type: String, required: true, trim: true },
    officialName: { type: String, required: true, trim: true },
    iso2: { type: String, required: true, uppercase: true, trim: true, minlength: 2, maxlength: 2, index: true, unique: true },
    iso3: { type: String, required: true, uppercase: true, trim: true, minlength: 3, maxlength: 3, unique: true },
    numericCode: { type: String, required: true, trim: true, index: true, unique: true },
    region: { type: String, trim: true },
    subRegion: { type: String, trim: true },
    flagEmoji: { type: String, trim: true },
    currencyCode: { type: String, uppercase: true, trim: true },
    currencyId: { type: Schema.Types.ObjectId, ref: 'Currency', default: null, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Country = mongoose.model<ICountry>('Country', CountrySchema);


