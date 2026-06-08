"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../../config/database.config");
const notification_category_model_1 = require("../../models/notification-category/notification-category.model");
dotenv_1.default.config();
const categories = [
    {
        name: 'Customer notifications',
        description: 'Notify customers about order and account events',
    },
    {
        name: 'Staff notifications',
        description: 'Notify staff members about new order events',
    },
    {
        name: 'Fulfillment request notification',
        description: 'Notify your fulfillment service provider when you mark an order as fulfilled',
    },
];
async function seedNotificationCategories() {
    try {
        await (0, database_config_1.connectDB)();
        for (const category of categories) {
            await notification_category_model_1.NotificationCategory.updateOne({ name: category.name }, { $set: category }, { upsert: true });
        }
        console.log('Notification categories seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding notification categories:', error);
        process.exit(1);
    }
}
seedNotificationCategories();
