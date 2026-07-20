import mongoose, { Schema, model, Document } from 'mongoose';

export enum DataSaleOption {
  QUALIFIES_AS_DATA_SALE = 'qualifies_as_data_sale',
  QUALIFIES_WITH_LIMITED_USE = 'qualifies_as_data_sale_limited_use',
  DOES_NOT_QUALIFY = 'does_not_qualify_as_data_sale',
}

export interface IPixel extends Document {
  storeId: mongoose.Types.ObjectId;
  pixelName: string;
  type: string;
  status: string;
  required: boolean;
  notRequired: boolean;
  marketing: boolean;
  analytics: boolean;
  preferences: boolean;
  dataSale: DataSaleOption;
  code: string;
}

const PixelSchema = new Schema<IPixel>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    pixelName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    notRequired: {
      type: Boolean,
      default: true,
    },
    marketing: {
      type: Boolean,
      default: false,
    },
    analytics: {
      type: Boolean,
      default: false,
    },
    preferences: {
      type: Boolean,
      default: false,
    },
    dataSale: {
      type: String,
      enum: Object.values(DataSaleOption),
      default: DataSaleOption.DOES_NOT_QUALIFY,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Pixel = model<IPixel>('Pixel', PixelSchema);


