/**
 * Backfill storeCode for stores that don't have one.
 * Run: npm run build && npm run seed:store-codes
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database.config";
import { Store } from "../models/store/store.model";

dotenv.config();

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateStoreCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return code;
}

async function backfillStoreCodes() {
  try {
    await connectDB();
    console.log("Connected to database");

    const storesWithoutCode = await Store.find({
      $or: [{ storeCode: { $exists: false } }, { storeCode: null }, { storeCode: "" }],
    }).lean();

    if (storesWithoutCode.length === 0) {
      console.log("All stores already have storeCode.");
      process.exit(0);
    }

    console.log(`Found ${storesWithoutCode.length} stores without storeCode.`);

    const existingStores = await Store.find({
      $and: [{ storeCode: { $exists: true } }, { storeCode: { $ne: null } }, { storeCode: { $ne: "" } }],
    })
      .select("storeCode")
      .lean();
    const usedCodes = new Set<string>(existingStores.map((s) => (s as any).storeCode).filter(Boolean));

    let updated = 0;
    for (const s of storesWithoutCode) {
      let code = "";
      let attempts = 0;
      do {
        code = generateStoreCode();
        if (!usedCodes.has(code)) break;
        attempts++;
      } while (attempts < 20);

      if (!code) {
        console.warn(`Could not generate unique code for store ${s._id}`);
        continue;
      }

      await Store.updateOne({ _id: s._id }, { $set: { storeCode: code.toUpperCase() } });
      usedCodes.add(code);
      updated++;
      console.log(`  ${(s as any).storeName} (${s._id}) → ${code}`);
    }

    console.log(`\n✅ Backfilled storeCode for ${updated} stores.`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error backfilling store codes:", error);
    process.exit(1);
  }
}

backfillStoreCodes();
