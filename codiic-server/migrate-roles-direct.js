require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB using the .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Sidebar sections
const sidebarSections = [
  "Client List",
  "Payment", 
  "Invoice",
  "User Management",
  "Membership",
  "Developer",
  "Support"
];

// Permission types
const permissionTypes = ["view", "edit", "upload"];

// Update roles directly in the database
const updateRolesDirectly = async () => {
  try {
    console.log('🔄 Starting direct database update...');
    
    // Get the roles collection directly
    const db = mongoose.connection.db;
    const rolesCollection = db.collection('roles');
    
    // Get all existing roles
    const roles = await rolesCollection.find({}).toArray();
    console.log(`Found ${roles.length} roles to update`);
    
    for (const role of roles) {
      console.log(`\n📝 Updating role: ${role.name}`);
      
      let newPermissions = [];
      
      if (role.name === 'super-admin' || role.isSuperAdmin) {
        // Super admin gets all permissions for all sections
        console.log('  → Super admin: Adding all permissions for all sections');
        newPermissions = sidebarSections.map(section => ({
          section: section,
          permissions: [...permissionTypes] // All permissions: view, edit, upload
        }));
        
        // Update isSuperAdmin flag
        role.isSuperAdmin = true;
      } else {
        // Other roles get basic permissions based on their role type
        console.log(`  → ${role.name}: Adding default permissions`);
        
        if (role.name === 'support-admin') {
          // Support admin gets view and edit for most sections
          newPermissions = sidebarSections.map(section => ({
            section: section,
            permissions: section === 'User Management' ? ['view'] : ['view', 'edit']
          }));
        } else if (role.name === 'developer-admin') {
          // Developer admin gets view and edit for development sections
          newPermissions = sidebarSections.map(section => ({
            section: section,
            permissions: ['Developer', 'Support'].includes(section) ? ['view', 'edit', 'upload'] : ['view']
          }));
        } else if (role.name === 'client-admin') {
          // Client admin gets view for client-related sections
          newPermissions = sidebarSections.map(section => ({
            section: section,
            permissions: ['Client List', 'Payment', 'Invoice'].includes(section) ? ['view', 'edit'] : ['view']
          }));
        } else {
          // Default: only view permissions
          newPermissions = sidebarSections.map(section => ({
            section: section,
            permissions: ['view']
          }));
        }
      }
      
      // Update the role directly in the database
      await rolesCollection.updateOne(
        { _id: role._id },
        {
          $set: { 
            permissions: newPermissions,
            isSuperAdmin: role.name === 'super-admin' || role.isSuperAdmin,
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`  ✅ Updated ${role.name} with ${newPermissions.length} section permissions`);
    }
    
    console.log('\n🎉 All roles updated successfully!');
    
    // Display updated roles
    console.log('\n📊 Updated roles summary:');
    const updatedRoles = await rolesCollection.find({}).toArray();
    for (const role of updatedRoles) {
      console.log(`\n${role.name}:`);
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(perm => {
          console.log(`  - ${perm.section}: [${perm.permissions.join(', ')}]`);
        });
      } else {
        console.log('  - No permissions found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating roles:', error);
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting direct database migration...');
    console.log(`🔗 Using MongoDB URI from .env file`);
    
    await connectDB();
    await updateRolesDirectly();
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the script
main();   