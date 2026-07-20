const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error);
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
  canEditPermissions: Boolean,
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: false });

const Role = mongoose.model('Role', roleSchema);

// Updated permissions with subsections
const updatedPermissions = {
  "super-admin": [
    { 
      section: "Client List", 
      permissions: ["view", "edit", "upload"],
      subsections: []
    },
    { 
      section: "Payment", 
      permissions: ["view", "edit", "upload"],
      subsections: []
    },
    { 
      section: "Invoice", 
      permissions: ["view", "edit", "upload"],
      subsections: []
    },
    { 
      section: "User Management", 
      permissions: ["view", "edit", "upload"],
      subsections: [
        { subsection: "Manage User", permissions: ["view", "edit", "upload"] },
        { subsection: "Roles and Permission", permissions: ["view", "edit", "upload"] }
      ]
    },
    { 
      section: "Membership", 
      permissions: ["view", "edit", "upload"],
      subsections: [
        { subsection: "Membership Plan", permissions: ["view", "edit", "upload"] }
      ]
    },
    { 
      section: "Developer", 
      permissions: ["view", "edit", "upload"],
      subsections: [
        { subsection: "Dev Admin", permissions: ["view", "edit", "upload"] },
        { subsection: "Theme Developer", permissions: ["view", "edit", "upload"] },
        { subsection: "Support Developer", permissions: ["view", "edit", "upload"] },
        { subsection: "Hire Developer Requests", permissions: ["view", "edit", "upload"] }
      ]
    },
    { 
      section: "Support", 
      permissions: ["view", "edit", "upload"],
      subsections: [
        { subsection: "Domain", permissions: ["view", "edit", "upload"] },
        { subsection: "Ticket", permissions: ["view", "edit", "upload"] },
        { subsection: "Raise Task", permissions: ["view", "edit", "upload"] },
        { subsection: "Live Support", permissions: ["view", "edit", "upload"] }
      ]
    }
  ],
  "support-admin": [
    { 
      section: "Client List", 
      permissions: ["view", "edit"],
      subsections: []
    },
    { 
      section: "User Management", 
      permissions: ["view", "edit"],
      subsections: [
        { subsection: "Manage User", permissions: ["view", "edit"] },
        { subsection: "Roles and Permission", permissions: ["view"] }
      ]
    },
    { 
      section: "Support", 
      permissions: ["view", "edit", "upload"],
      subsections: [
        { subsection: "Domain", permissions: ["view", "edit", "upload"] },
        { subsection: "Ticket", permissions: ["view", "edit", "upload"] },
        { subsection: "Raise Task", permissions: ["view", "edit", "upload"] },
        { subsection: "Live Support", permissions: ["view", "edit", "upload"] }
      ]
    }
  ],
  "developer-admin": [
    { 
      section: "Client List", 
      permissions: ["view", "edit"],
      subsections: []
    },
    { 
      section: "Developer", 
      permissions: ["view", "edit", "upload"],
      subsections: [
        { subsection: "Dev Admin", permissions: ["view", "edit", "upload"] },
        { subsection: "Theme Developer", permissions: ["view", "edit", "upload"] },
        { subsection: "Support Developer", permissions: ["view", "edit", "upload"] },
        { subsection: "Hire Developer Requests", permissions: ["view", "edit", "upload"] }
      ]
    },
    { 
      section: "Support", 
      permissions: ["view", "edit"],
      subsections: [
        { subsection: "Domain", permissions: ["view"] },
        { subsection: "Ticket", permissions: ["view", "edit"] },
        { subsection: "Raise Task", permissions: ["view"] },
        { subsection: "Live Support", permissions: ["view"] }
      ]
    }
  ],
  "client-admin": [
    { 
      section: "Client List", 
      permissions: ["view"],
      subsections: []
    },
    { 
      section: "Payment", 
      permissions: ["view"],
      subsections: []
    },
    { 
      section: "Invoice", 
      permissions: ["view"],
      subsections: []
    },
    { 
      section: "Support", 
      permissions: ["view"],
      subsections: [
        { subsection: "Domain", permissions: ["view"] },
        { subsection: "Ticket", permissions: ["view"] },
        { subsection: "Raise Task", permissions: ["view"] },
        { subsection: "Live Support", permissions: ["view"] }
      ]
    }
  ]
};

async function updateRolesWithSubsections() {
  try {
    await connectDB();
    console.log('🔄 Starting role update with subsections...');
    
    for (const [roleName, permissions] of Object.entries(updatedPermissions)) {
      console.log(`\n📝 Updating ${roleName}...`);
      
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        console.log(`❌ Role ${roleName} not found`);
        continue;
      }
      
      // Update permissions with subsections
      role.permissions = permissions;
      role.updatedAt = new Date();
      
      await role.save();
      console.log(`✅ Updated ${roleName} with subsections`);
      
      // Log the updated permissions
      console.log(`   Permissions for ${roleName}:`);
      permissions.forEach(perm => {
        console.log(`   - ${perm.section}: [${perm.permissions.join(', ')}]`);
        if (perm.subsections && perm.subsections.length > 0) {
          perm.subsections.forEach(sub => {
            console.log(`     └─ ${sub.subsection}: [${sub.permissions.join(', ')}]`);
          });
        }
      });
    }
    
    console.log('\n🎉 All roles updated successfully with subsections!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating roles:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateRolesWithSubsections();
}

module.exports = { updateRolesWithSubsections };
