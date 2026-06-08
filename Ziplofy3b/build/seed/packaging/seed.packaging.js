"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const database_config_1 = require("../../config/database.config");
const packaging_model_1 = require("../../models/packaging/packaging.model");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const packagingData = [
    {
        storeId: new mongoose_1.default.Types.ObjectId(), // This will need to be set properly
        packageName: "Sample Box",
        packageType: "box",
        length: 22,
        width: 13.7,
        height: 4.2,
        dimensionsUnit: "cm",
        weight: 0,
        weightUnit: "kg",
        isDefault: true
    }
];
async function seedPackaging() {
    try {
        // Connect to database first
        await (0, database_config_1.connectDB)();
        // Clear existing data
        await packaging_model_1.Packaging.deleteMany({});
        // Seed new data
        for (const packaging of packagingData) {
            await packaging_model_1.Packaging.create({
                storeId: packaging.storeId,
                packageName: packaging.packageName,
                packageType: packaging.packageType,
                length: packaging.length,
                width: packaging.width,
                height: packaging.height,
                dimensionsUnit: packaging.dimensionsUnit,
                weight: packaging.weight,
                weightUnit: packaging.weightUnit,
                isDefault: packaging.isDefault
            });
        }
        console.log("Packaging options seeded successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("Error seeding packaging:", err);
        process.exit(1);
    }
}
seedPackaging();
