import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnRules extends Document {
  storeId: mongoose.Types.ObjectId;
  enabled: boolean;
  returnWindow: string;
  returnShippingCost: 'customer provides return shipping' | 'free return shipping' | 'flat rate return shipping';
  flatRate?: number;
  chargeRestockingFree: boolean;
  restockingFee?: number;
  finalSaleSelection?: 'collections' | 'products' | null;
  createdAt: Date;
  updatedAt: Date;
}

const returnRulesSchema = new Schema<IReturnRules>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    enabled: { type: Boolean, default: false },
    returnWindow: { type: String, required: true, default: '30' },
    returnShippingCost: {
      type: String,
      enum: ['customer provides return shipping', 'free return shipping', 'flat rate return shipping'],
      required: true,
      default: 'free return shipping',
    },
    flatRate: { type: Number, min: 0 },
    chargeRestockingFree: { type: Boolean, default: false },
    restockingFee: { type: Number, min: 0, max: 100 },
    finalSaleSelection: {
      type: String,
      enum: ['collections', 'products'],
      default: 'collections',
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

returnRulesSchema.index({ storeId: 1, createdAt: -1 });

export const ReturnRules: Model<IReturnRules> =
  mongoose.models.ReturnRules || mongoose.model<IReturnRules>('ReturnRules', returnRulesSchema);


