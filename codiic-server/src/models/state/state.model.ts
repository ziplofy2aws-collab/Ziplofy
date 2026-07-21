import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IState extends Document {
  name: string;
  code: string; // State code (e.g., "CA" for California, "ON" for Ontario)
  countryId: Types.ObjectId;
  countryIso2: string; // For quick reference without populating
  type?: string; // e.g., "state", "province", "territory"
  createdAt: Date;
  updatedAt: Date;
}

const StateSchema = new Schema<IState>(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, trim: true, uppercase: true, index: true },
    countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true, index: true },
    countryIso2: { type: String, required: true, uppercase: true, trim: true, minlength: 2, maxlength: 2, index: true },
    type: { type: String, trim: true, default: 'state' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index to ensure unique state code per country
StateSchema.index({ countryId: 1, code: 1 }, { unique: true });
StateSchema.index({ countryIso2: 1, code: 1 }, { unique: true });

export const State = mongoose.model<IState>('State', StateSchema);

