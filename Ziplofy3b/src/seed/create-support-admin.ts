import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database.config";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";

// Load environment variables (.env.development overrides .env for local runs)
dotenv.config();
dotenv.config({ path: ".env.development" });

async function createSupportAdmin() {
  try {
    await connectDB();
    console.log("🔗 Connected to database");

    // Find support-admin role
    const role = await Role.findOne({ name: "support-admin" });
    if (!role) {
      throw new Error("❌ Role 'support-admin' not found. Please seed roles first.");
    }
    console.log(`✅ Found role: ${role.name} (${role._id})`);

    // Check if user already exists
    const email = "blinderspeaky823@gmail.com";
    let user = await User.findOne({ email }).select("+password");

    // Derive name from email
    const local = email.split("@")[0];
    const derivedName = local
      .split(/[._-]+/)
      .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
      .join(" ");

    if (!user) {
      // Create new user
      user = new User({
        name: derivedName || "Support Admin",
        email,
        password: "123456",
        role: role._id,
        status: "active",
      } as any);
      await user.save();
      console.log(`✅ Created support-admin user: ${email}`);
    } else {
      // Update existing user
      (user as any).name = derivedName || "Support Admin";
      (user as any).role = role._id as any;
      (user as any).status = "active";
      (user as any).password = "123456"; // Will be hashed by pre-save hook
      await user.save();
      console.log(`🔄 Updated support-admin user: ${email}`);
    }

    // Verify user was created/updated
    const verifyUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");
    
    console.log("\n📋 User Details:");
    console.log({
      _id: verifyUser?._id,
      name: verifyUser?.name,
      email: verifyUser?.email,
      role: (verifyUser?.role as any)?.name,
      status: verifyUser?.status,
    });

    console.log("\n🎉 Support-admin user created/updated successfully!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error creating support-admin user:", err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSupportAdmin();
}

export { createSupportAdmin };

