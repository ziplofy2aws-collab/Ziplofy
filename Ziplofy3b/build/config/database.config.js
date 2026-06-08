"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
require("../utils/env.utils");
const mongoose_1 = __importDefault(require("mongoose"));
const installed_themes_index_util_1 = require("../utils/installed-themes-index.util");
// const MONGO_URI = "mongodb://developer200419_db_user:7UIJzXhODvAqFVKC@ac-mwnk6wr-shard-00-00.p33ikoz.mongodb.net:27017,ac-mwnk6wr-shard-00-01.p33ikoz.mongodb.net:27017,ac-mwnk6wr-shard-00-02.p33ikoz.mongodb.net:27017/?ssl=true&replicaSet=atlas-c5qzh1-shard-0&authSource=admin&appName=Cluster0"
async function connectDB() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");
        await (0, installed_themes_index_util_1.reconcileInstalledThemesIndexes)();
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
    }
}
