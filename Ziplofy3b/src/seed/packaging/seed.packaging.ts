import mongoose from "mongoose";
import { connectDB } from "../../config/database.config";
import { IPackaging, Packaging } from "../../models/packaging/packaging.model";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const packagingData:Omit<IPackaging, "_id" | "createdAt" | "updatedAt">[] = [
    {
        storeId: new mongoose.Types.ObjectId(), // This will need to be set properly
        packageName: "Sample Box",
        packageType: "box" as const,
        length: 22,
        width: 13.7,
        height: 4.2,
        dimensionsUnit: "cm" as const,
        weight: 0,
        weightUnit: "kg" as const,
        isDefault: true
    }
];

async function seedPackaging() {
  try {
    // Connect to database first
    await connectDB();
    
    // Clear existing data
    await Packaging.deleteMany({});
    
    // Seed new data
    for (const packaging of packagingData) {
      await Packaging.create({
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
  } catch (err) {
    console.error("Error seeding packaging:", err);
    process.exit(1);
  }
}

seedPackaging();
