import mongoose, { Model, Schema } from 'mongoose';

export interface ICollectionEntry {
  collectionId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const collectionEntrySchema = new Schema<ICollectionEntry>({
  collectionId: { type: Schema.Types.ObjectId, ref: 'Collections', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  position: { type: Number, default: 0, min: 0 },
}, {
  timestamps: true,
  versionKey: false,
});

collectionEntrySchema.index({ collectionId: 1, productId: 1 }, { unique: true });

export const CollectionEntry: Model<ICollectionEntry> = mongoose.model<ICollectionEntry>('CollectionEntry', collectionEntrySchema);


