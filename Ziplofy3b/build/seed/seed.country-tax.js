"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_config_1 = require("../config/database.config");
const country_model_1 = require("../models/country/country.model");
const country_tax_model_1 = require("../models/country-tax/country-tax.model");
dotenv_1.default.config();
async function seedCountryTax() {
    try {
        await (0, database_config_1.connectDB)();
        console.log('Connected to database');
        // Resolve India dynamically from Country seed data.
        const india = await country_model_1.Country.findOne({ iso2: 'IN' }).select('_id').lean();
        if (!india?._id) {
            console.log('India country not found (iso2=IN). Please run seed:countries first.');
            process.exit(0);
        }
        const indiaObjectId = new mongoose_1.default.Types.ObjectId(String(india._id));
        // Create or update country tax for India
        console.log('Creating/updating country tax for India...');
        const countryTax = await country_tax_model_1.CountryTax.findOneAndUpdate({
            countryId: indiaObjectId,
        }, {
            $set: {
                countryId: indiaObjectId,
                taxRate: 9,
            },
        }, {
            upsert: true,
            new: true,
        });
        console.log('\n✅ Country tax seeded successfully!');
        console.log(`  - Country ID: ${countryTax.countryId.toString()}`);
        console.log(`  - Tax Rate: ${countryTax.taxRate}%`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding country tax:', error);
        process.exit(1);
    }
}
// Run the seed function
seedCountryTax();
