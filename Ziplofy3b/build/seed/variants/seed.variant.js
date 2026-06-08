"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_config_1 = require("../../config/database.config");
const variants_model_1 = require("../../models/variants/variants.model");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const variantData = [
    { name: "Size", values: ["XS", "S", "M", "L", "XL", "XXL"] },
    { name: "Color", values: ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Gray", "Purple", "Brown"] },
    { name: "Material", values: ["Cotton", "Polyester", "Leather", "Wool", "Silk", "Nylon", "Linen", "Synthetic"] },
    { name: "Style", values: ["Casual", "Formal", "Sports", "Vintage", "Modern", "Classic"] },
    { name: "Capacity", values: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] },
    { name: "Weight", values: ["0.5kg", "1kg", "1.5kg", "2kg", "5kg"] },
    { name: "Length", values: ["Short", "Medium", "Long", "Extra Long"] },
    { name: "Width", values: ["Narrow", "Standard", "Wide"] },
    { name: "Height", values: ["Low", "Medium", "High"] },
    { name: "Pattern", values: ["Solid", "Striped", "Polka Dot", "Checked", "Floral", "Camouflage"] },
    { name: "Fit", values: ["Slim", "Regular", "Loose"] },
    { name: "Flavor", values: ["Vanilla", "Chocolate", "Strawberry", "Coffee", "Mint"] },
    { name: "Finish", values: ["Matte", "Glossy", "Satin", "Metallic"] },
    { name: "Volume", values: ["100ml", "250ml", "500ml", "1L"] },
    { name: "Age Group", values: ["Baby", "Toddler", "Kids", "Teen", "Adult", "Senior"] },
    { name: "Gender", values: ["Male", "Female", "Unisex"] },
    { name: "Occasion", values: ["Wedding", "Party", "Casual", "Sports", "Office"] }
];
async function seedVariants() {
    try {
        // Connect to database first
        await (0, database_config_1.connectDB)();
        // Clear existing data
        await variants_model_1.Variants.deleteMany({});
        // Seed new data
        for (const option of variantData) {
            await variants_model_1.Variants.create({
                name: option.name,
                values: option.values.map(v => v)
            });
        }
        console.log("Variant options seeded successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("Error seeding variants:", err);
        process.exit(1);
    }
}
seedVariants();
