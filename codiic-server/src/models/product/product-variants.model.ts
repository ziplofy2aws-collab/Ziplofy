import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProductVariant {
  productId: mongoose.Types.ObjectId;
  optionValues: Map<string, string>;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  cost?: number | null;
  profit?: number | null;
  marginPercent?: number | null;
  weightValue: number;
  weightUnit: string;
  package: mongoose.Types.ObjectId;
  countryOfOrigin?: string | null;
  images?: string[];
  unitPriceTotalAmount?: number;
  unitPriceTotalAmountMetric?: 'milligram' | 'gram' | 'kilogram' | 'milliliter' | 'centiliter' | 'liter' | 'cubic_meter' | 'centimeter' | 'meter' | 'square_meter' | 'item';
  unitPriceBaseMeasure?: number;
  unitPriceBaseMeasureMetric?: 'milligram' | 'gram' | 'kilogram' | 'milliliter' | 'centiliter' | 'liter' | 'cubic_meter' | 'centimeter' | 'meter' | 'square_meter' | 'item';
  hsCode?: string | null;
  chargeTax: boolean;
  outOfStockContinueSelling: boolean;
  isInventoryTrackingEnabled: boolean;
  isSynthetic: boolean;
  isPhysicalProduct: boolean;
  depricated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IProductVariantDocument = IProductVariant & Document;

const productVariantSchema = new Schema<IProductVariantDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    optionValues: {
      type: Map,
      of: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "SKU cannot exceed 100 characters"],
    },
    barcode: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "Barcode cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    cost: {
      type: Number,
      default: null,
      min: 0,
    },
    profit: {
      type: Number,
      default: null,
      min: 0,
    },
    marginPercent: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    unitPriceTotalAmount: { type: Number, default: undefined, min: 0 },
    unitPriceTotalAmountMetric: {
      type: String,
      enum: ['milligram','gram','kilogram','milliliter','centiliter','liter','cubic_meter','centimeter','meter','square_meter','item'],
      default: undefined,
    },
    unitPriceBaseMeasure: { type: Number, default: undefined, min: 0 },
    unitPriceBaseMeasureMetric: {
      type: String,
      enum: ['milligram','gram','kilogram','milliliter','centiliter','liter','cubic_meter','centimeter','meter','square_meter','item'],
      default: undefined,
    },
    chargeTax: { type: Boolean, default: true },
    weightValue: { type: Number, default: 0 },
    weightUnit: { type: String, default: "kg" },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Packaging",
      required: false,
    },
    countryOfOrigin: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "Country of origin cannot exceed 100 characters"],
    },
    hsCode: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, 'HS code cannot exceed 100 characters'],
    },
    images: [{ type: String, trim: true }],
    outOfStockContinueSelling: {
      type: Boolean,
      default: false,
    },
    isInventoryTrackingEnabled: { type: Boolean, required: true, default: true },
    isSynthetic: { type: Boolean, required: true, default: false },
    isPhysicalProduct: { type: Boolean, required: true, default: true },
    depricated: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const ProductVariant: Model<IProductVariantDocument> = mongoose.model<IProductVariantDocument>(
  "ProductVariant",
  productVariantSchema
);
