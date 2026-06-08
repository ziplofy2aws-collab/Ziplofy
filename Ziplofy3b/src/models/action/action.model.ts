import mongoose, { Document, Model, Schema } from "mongoose";

export enum ActionType {
    SEND_EMAIL = "send_email",
    SEND_SMS = "send_sms",
    SEND_PUSH_NOTIFICATION = "send_push_notification",
    SEND_WHATSAPP_MESSAGE = "send_whatsapp_message",
}

export interface IAction extends Document {
  actionType: ActionType; // e.g. ActionType.SEND_EMAIL
  name: string;          // e.g. "Send Email"
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAction>(
  {
    actionType: { type: String, required: true, unique: true, index: true, trim: true, enum: Object.values(ActionType) },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true, versionKey: false }
);

export const Action: Model<IAction> = mongoose.model<IAction>("Action", ActionSchema);


