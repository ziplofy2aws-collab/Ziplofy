"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmins = seedAdmins;
const database_config_1 = require("../config/database.config");
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
async function createOrUpdateUser(email, password, roleName) {
    // resolve role by name
    const role = await role_model_1.Role.findOne({ name: roleName });
    if (!role) {
        throw new Error(`Role '${roleName}' not found. Seed roles first.`);
    }
    // try find existing user
    let user = await user_model_1.User.findOne({ email }).select("+password");
    // derive a readable name from email local part
    const local = email.split("@")[0];
    const derivedName = local
        .split(/[._-]+/)
        .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
        .join(" ");
    if (!user) {
        // create fresh user (pre-save will hash password)
        user = new user_model_1.User({
            name: derivedName || "Admin User",
            email,
            password,
            role: role._id,
            status: "active",
        });
        await user.save();
        console.log(`✅ Created user: ${email} with role '${roleName}'`);
    }
    else {
        // update fields; ensure password gets hashed by save hook if changed
        user.name = user.name || derivedName || "Admin User";
        user.role = role._id;
        user.status = "active"; // Force to active status
        // update password if provided (always update for seed consistency)
        user.password = password;
        await user.save();
        console.log(`🔄 Updated user: ${email} with role '${roleName}'`);
    }
}
async function seedAdmins() {
    try {
        await (0, database_config_1.connectDB)();
        const entries = [
            { email: "developer200419@gmail.com", password: "zebronics", role: "super-admin" },
            { email: "blinderspeaky823@gmail.com", password: "zebronics", role: "support-admin" },
        ];
        for (const entry of entries) {
            await createOrUpdateUser(entry.email, entry.password, entry.role);
        }
        console.log("\n🎉 Admin users seeded successfully.");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error seeding admin users:", err);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    seedAdmins();
}
