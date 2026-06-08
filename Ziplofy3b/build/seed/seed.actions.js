"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../config/database.config");
const action_model_1 = require("../models/action/action.model");
dotenv_1.default.config();
async function seedActions() {
    try {
        await (0, database_config_1.connectDB)();
        const actions = [
            {
                actionType: action_model_1.ActionType.SEND_EMAIL,
                name: 'Send Email',
                description: 'Send an email to a recipient',
            },
            {
                actionType: action_model_1.ActionType.SEND_SMS,
                name: 'Send SMS',
                description: 'Send an SMS to a phone number',
            },
            {
                actionType: action_model_1.ActionType.SEND_PUSH_NOTIFICATION,
                name: 'Send Push Notification',
                description: 'Send a push notification to a device/user',
            },
            {
                actionType: action_model_1.ActionType.SEND_WHATSAPP_MESSAGE,
                name: 'Send WhatsApp Message',
                description: 'Send a WhatsApp message to a recipient',
            },
        ];
        for (const a of actions) {
            await action_model_1.Action.updateOne({ actionType: a.actionType }, { $set: a }, { upsert: true });
        }
        // eslint-disable-next-line no-console
        console.log('Actions seeding completed:', { count: actions.length });
        process.exit(0);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error seeding actions:', err);
        process.exit(1);
    }
}
seedActions();
