"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Backfill storeCode for stores that don't have one.
 * Run: npm run build && npm run seed:store-codes
 */
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../config/database.config");
const store_model_1 = require("../models/store/store.model");
dotenv_1.default.config();
const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateStoreCode() {
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
    }
    return code;
}
async function backfillStoreCodes() {
    try {
        await (0, database_config_1.connectDB)();
        console.log("Connected to database");
        const storesWithoutCode = await store_model_1.Store.find({
            $or: [{ storeCode: { $exists: false } }, { storeCode: null }, { storeCode: "" }],
        }).lean();
        if (storesWithoutCode.length === 0) {
            console.log("All stores already have storeCode.");
            process.exit(0);
        }
        console.log(`Found ${storesWithoutCode.length} stores without storeCode.`);
        const existingStores = await store_model_1.Store.find({
            $and: [{ storeCode: { $exists: true } }, { storeCode: { $ne: null } }, { storeCode: { $ne: "" } }],
        })
            .select("storeCode")
            .lean();
        const usedCodes = new Set(existingStores.map((s) => s.storeCode).filter(Boolean));
        let updated = 0;
        for (const s of storesWithoutCode) {
            let code = "";
            let attempts = 0;
            do {
                code = generateStoreCode();
                if (!usedCodes.has(code))
                    break;
                attempts++;
            } while (attempts < 20);
            if (!code) {
                console.warn(`Could not generate unique code for store ${s._id}`);
                continue;
            }
            await store_model_1.Store.updateOne({ _id: s._id }, { $set: { storeCode: code.toUpperCase() } });
            usedCodes.add(code);
            updated++;
            console.log(`  ${s.storeName} (${s._id}) → ${code}`);
        }
        console.log(`\n✅ Backfilled storeCode for ${updated} stores.`);
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error backfilling store codes:", error);
        process.exit(1);
    }
}
backfillStoreCodes();
