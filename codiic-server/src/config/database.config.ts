import '../utils/env.utils';

import mongoose from "mongoose";
import { reconcileInstalledThemesIndexes } from "../utils/installed-themes-index.util";

// const MONGO_URI = "mongodb://developer200419_db_user:7UIJzXhODvAqFVKC@ac-mwnk6wr-shard-00-00.p33ikoz.mongodb.net:27017,ac-mwnk6wr-shard-00-01.p33ikoz.mongodb.net:27017,ac-mwnk6wr-shard-00-02.p33ikoz.mongodb.net:27017/?ssl=true&replicaSet=atlas-c5qzh1-shard-0&authSource=admin&appName=Cluster0"

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB connected");
    await reconcileInstalledThemesIndexes();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}
