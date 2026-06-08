import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * One MongoDB document per file the store uploaded to cloud storage (e.g. S3).
 * A store has many documents — same storeId, different keys.
 */
export interface IStoreCloudStorage extends Document {
  storeId: mongoose.Types.ObjectId;
  /** S3 object key returned from the presigned-url flow (not a public URL). */
  key: string;
}

const storeCloudStorageSchema = new Schema<IStoreCloudStorage>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1024, 'Storage key cannot exceed 1024 characters'],
    },
  },
  { timestamps: true, versionKey: false }
);

storeCloudStorageSchema.index({ storeId: 1, key: 1 }, { unique: true });
storeCloudStorageSchema.index({ storeId: 1, createdAt: -1 });

export const StoreCloudStorage: Model<IStoreCloudStorage> =
  mongoose.models.StoreCloudStorage ||
  mongoose.model<IStoreCloudStorage>('StoreCloudStorage', storeCloudStorageSchema);
