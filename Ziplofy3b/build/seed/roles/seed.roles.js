"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRoles = void 0;
exports.seedRoles = seedRoles;
const database_config_1 = require("../../config/database.config");
const role_model_1 = require("../../models/role.model");
const defaultRoles = [
    {
        name: "super-admin",
        description: "Full system access with all permissions",
        isSuperAdmin: true,
        permissions: [
            { section: "Client List", permissions: ["view", "edit", "upload"] },
            { section: "Payment", permissions: ["view", "edit", "upload"] },
            { section: "Invoice", permissions: ["view", "edit", "upload"] },
            { section: "User Management", permissions: ["view", "edit", "upload"] },
            { section: "Membership", permissions: ["view", "edit", "upload"] },
            { section: "Developer", permissions: ["view", "edit", "upload"] },
            { section: "Support", permissions: ["view", "edit", "upload"] }
        ]
    },
    {
        name: "support-admin",
        description: "Support team with access to client support and user management",
        isSuperAdmin: false,
        permissions: [
            { section: "Client List", permissions: ["view", "edit"] },
            { section: "User Management", permissions: ["view", "edit"] },
            { section: "Support", permissions: ["view", "edit", "upload"] }
        ]
    },
    {
        name: "developer-admin",
        description: "Developer team with access to development and client management",
        isSuperAdmin: false,
        permissions: [
            { section: "Client List", permissions: ["view", "edit"] },
            { section: "Developer", permissions: ["view", "edit", "upload"] },
            { section: "Support", permissions: ["view", "edit"] }
        ]
    },
    {
        name: "client-admin",
        description: "Client admin with limited access to client-related features",
        isSuperAdmin: false,
        permissions: [
            { section: "Client List", permissions: ["view"] },
            { section: "Payment", permissions: ["view"] },
            { section: "Invoice", permissions: ["view"] },
            { section: "Support", permissions: ["view"] }
        ]
    }
];
exports.defaultRoles = defaultRoles;
async function seedRoles() {
    try {
        // Connect to database first
        await (0, database_config_1.connectDB)();
        console.log("Starting role seeding...");
        // Clear existing roles
        await role_model_1.Role.deleteMany({});
        console.log("Cleared existing roles");
        // Insert default roles
        const createdRoles = await role_model_1.Role.insertMany(defaultRoles);
        console.log(`Created ${createdRoles.length} default roles`);
        // Log created roles
        createdRoles.forEach(role => {
            console.log(`- ${role.name}: ${role.description}`);
            if (role.isSuperAdmin) {
                console.log("  Super Admin - All permissions enabled");
            }
            else {
                role.permissions.forEach(perm => {
                    console.log(`  ${perm.section}: ${perm.permissions.join(", ")}`);
                });
            }
        });
        console.log("Roles seeded successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("Error seeding roles:", err);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    seedRoles();
}
