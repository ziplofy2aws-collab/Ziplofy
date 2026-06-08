import mongoose from "mongoose";
import { connectDB } from "../config/database.config";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";

async function createOrUpdateUser(email: string, password: string, roleName: string) {
  // resolve role by name
  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new Error(`Role '${roleName}' not found. Seed roles first.`);
  }

  // try find existing user
  let user = await User.findOne({ email }).select("+password");

  // derive a readable name from email local part
  const local = email.split("@")[0];
  const derivedName = local
    .split(/[._-]+/)
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");

  if (!user) {
    // create fresh user (pre-save will hash password)
    user = new User({
      name: derivedName || "Admin User",
      email,
      password,
      role: role._id,
      status: "active",
    } as any);
    await user.save();
    console.log(`✅ Created user: ${email} with role '${roleName}'`);
  } else {
    // update fields; ensure password gets hashed by save hook if changed
    (user as any).name = (user as any).name || derivedName || "Admin User";
    (user as any).role = role._id as any;
    (user as any).status = "active"; // Force to active status

    // update password if provided (always update for seed consistency)
    (user as any).password = password;
    await user.save();
    console.log(`🔄 Updated user: ${email} with role '${roleName}'`);
  }
}

async function seedAdmins() {
  try {
    await connectDB();

    const entries: Array<{ email: string; password: string; role: string }> = [
      { email: "developer200419@gmail.com", password: "zebronics", role: "super-admin" },
      { email: "blinderspeaky823@gmail.com", password: "zebronics", role: "support-admin" },
    ];

    for (const entry of entries) {
      await createOrUpdateUser(entry.email, entry.password, entry.role);
    }

    console.log("\n🎉 Admin users seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin users:", err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmins();
}

export { seedAdmins };
