"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupportAdmin = createSupportAdmin;
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../config/database.config");
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
// Load environment variables (.env.development overrides .env for local runs)
dotenv_1.default.config();
dotenv_1.default.config({ path: ".env.development" });
async function createSupportAdmin() {
    try {
        await (0, database_config_1.connectDB)();
        console.log("🔗 Connected to database");
        // Find support-admin role
        const role = await role_model_1.Role.findOne({ name: "support-admin" });
        if (!role) {
            throw new Error("❌ Role 'support-admin' not found. Please seed roles first.");
        }
        console.log(`✅ Found role: ${role.name} (${role._id})`);
        // Check if user already exists
        const email = "blinderspeaky823@gmail.com";
        let user = await user_model_1.User.findOne({ email }).select("+password");
        // Derive name from email
        const local = email.split("@")[0];
        const derivedName = local
            .split(/[._-]+/)
            .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
            .join(" ");
        if (!user) {
            // Create new user
            user = new user_model_1.User({
                name: derivedName || "Support Admin",
                email,
                password: "123456",
                role: role._id,
                status: "active",
            });
            await user.save();
            console.log(`✅ Created support-admin user: ${email}`);
        }
        else {
            // Update existing user
            user.name = derivedName || "Support Admin";
            user.role = role._id;
            user.status = "active";
            user.password = "123456"; // Will be hashed by pre-save hook
            await user.save();
            console.log(`🔄 Updated support-admin user: ${email}`);
        }
        // Verify user was created/updated
        const verifyUser = await user_model_1.User.findById(user._id)
            .select("-password")
            .populate("role", "name description");
        console.log("\n📋 User Details:");
        console.log({
            _id: verifyUser?._id,
            name: verifyUser?.name,
            email: verifyUser?.email,
            role: verifyUser?.role?.name,
            status: verifyUser?.status,
        });
        console.log("\n🎉 Support-admin user created/updated successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error creating support-admin user:", err.message);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    createSupportAdmin();
}
