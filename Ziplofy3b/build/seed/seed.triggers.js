"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../config/database.config");
const trigger_model_1 = require("../models/trigger/trigger.model");
const automation_flow_model_1 = require("../models/automation/automation-flow.model");
dotenv_1.default.config();
async function seedTriggers() {
    try {
        await (0, database_config_1.connectDB)();
        const payload = {
            key: automation_flow_model_1.TriggerKey.ADD_TO_CART,
            name: 'Add to cart',
            description: '',
            hasConditions: true,
            exposedVariables: [
                {
                    path: 'cart.quantity',
                    label: 'Quantity',
                    type: 'number',
                    description: 'Number of items currently in the cart',
                },
            ],
        };
        const res = await trigger_model_1.Trigger.updateOne({ key: payload.key }, { $set: payload }, { upsert: true });
        // eslint-disable-next-line no-console
        console.log('Triggers seeding completed:', {
            acknowledged: res.acknowledged,
            upsertedId: res.upsertedId,
            matchedCount: res.matchedCount,
            modifiedCount: res.modifiedCount,
        });
        process.exit(0);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error seeding triggers:', err);
        process.exit(1);
    }
}
seedTriggers();
