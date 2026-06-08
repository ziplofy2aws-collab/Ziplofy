const mongoose = require('mongoose');

// Connect to MongoDB using the connection string from the image
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://ziplofy:ziplofy@cluster0.6kameny.mongodb.net/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected to cluster0.6kameny.mongodb.net');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Role schema
const roleSchema = new mongoose.Schema({
  name: String,
  description: String,
  level: Number,
  permissions: [mongoose.Schema.Types.Mixed],
  isDefault: Boolean,
  isProtected: Boolean,
  isSystem: Boolean,
  isSuperAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date,
  }, { versionKey: false });

const Role = mongoose.model('Role', roleSchema);

// New permission structure based on sidebar elements
const newPermissions = {
  "super-admin": [
    { section: "Client List", permissions: ["view", "edit", "upload"] },
    { section: "Payment", permissions: ["view", "edit", "upload"] },
    { section: "Invoice", permissions: ["view", "edit", "upload"] },
    { section: "User Management", permissions: ["view", "edit", "upload"] },
    { section: "Membership", permissions: ["view", "edit", "upload"] },
    { section: "Developer", permissions: ["view", "edit", "upload"] },
    { section: "Support", permissions: ["view", "edit", "upload"] }
  ],
  "support-admin": [
    { section: "Client List", permissions: ["view", "edit"] },
    { section: "User Management", permissions: ["view", "edit"] },
    { section: "Support", permissions: ["view", "edit", "upload"] }
  ],
  "developer-admin": [
    { section: "Client List", permissions: ["view", "edit"] },
    { section: "Developer", permissions: ["view", "edit", "upload"] },
    { section: "Support", permissions: ["view", "edit"] }
  ],
  "client-admin": [
    { section: "Client List", permissions: ["view"] },
    { section: "Payment", permissions: ["view"] },
    { section: "Invoice", permissions: ["view"] },
    { section: "Support", permissions: ["view"] }
  ]
};

async function updateRoles() {
  try {
    await connectDB();
    
    console.log("🔄 Starting role permissions update...");
    
    // Get all existing roles
    const existingRoles = await Role.find({});
    console.log(`📊 Found ${existingRoles.length} existing roles`);
    
    for (const role of existingRoles) {
      console.log(`\n🔧 Updating role: ${role.name}`);
      
      // Update permissions based on role name
      const newPermissionStructure = newPermissions[role.name];
      if (newPermissionStructure) {
        // Clear old permissions and set new ones
        role.permissions = newPermissionStructure;
        role.isSuperAdmin = role.name === 'super-admin';
        role.updatedAt = new Date();
        
        await role.save();
        console.log(`✅ Updated ${role.name} with new sidebar-based permissions:`);
        newPermissionStructure.forEach(perm => {
          console.log(`   📁 ${perm.section}: ${perm.permissions.join(", ")}`);
        });
      } else {
        console.log(`⚠️  No new permissions defined for role: ${role.name}`);
      }
    }
    
    console.log("\n🎉 All roles updated successfully!");
    console.log("📋 Summary of changes:");
    console.log("   • Replaced old permission structure (Roles Create, etc.)");
    console.log("   • Added sidebar-based permissions (Client List, Payment, etc.)");
    console.log("   • Each section now has view/edit/upload permissions");
    console.log("   • Super admin has all permissions for all sections");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating roles:", err);
    process.exit(1);
  }
}

updateRoles();