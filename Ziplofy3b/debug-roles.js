require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB using the .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) { //@ts-ignore
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Debug the roles data
const debugRoles = async () => {
  try {
    console.log('🔍 Debugging roles data from database...');
    // Get the roles collection directly
    const db = mongoose.connection.db;
    const rolesCollection = db.collection('roles');
    
    // Get all roles
    const roles = await rolesCollection.find({}).toArray();
    console.log(`\n📊 Found ${roles.length} roles in database:\n`);
    
    for (const role of roles) 
      console.log(`🔍 Role: ${role.name}`);
      console.log(`   ID: ${role._id}`);
      console.log(`   isSuperAdmin: ${role.isSuperAdmin}`);
      console.log(`   Permissions count: ${role.permissions ? role.permissions.length : 0}`);
      
      if (role.permissions && Array.isArray(role.permissions)) {
        console.log(`   📋 Permissions:`);
        role.permissions.forEach(perm => {
          console.log(`      - ${perm.section}: [${perm.permissions.join(', ')}]`);
        });
      } else {
        console.log(`❌ No permissions found`);
      }
      console.log('');
    }
    
    // Test specific role permissions

    console.log('🧪 Testing specific permissions:');
    const supportAdmin = roles.find(r => r.name === 'support-admin');
    if (supportAdmin) {
      console.log(`\nSupport Admin permissions:`);
      const userMgmtPerm = supportAdmin.permissions.find(p => p.section === 'User Management');
      if (userMgmtPerm) {
        console.log(`  User Management: [${userMgmtPerm.permissions.join(', ')}]`);
        console.log(`  Has 'view': ${userMgmtPerm.permissions.includes('view')}`);
        console.log(`  Has 'edit': ${userMgmtPerm.permissions.includes('edit')}`);
        console.log(`  Has 'upload': ${userMgmtPerm.permissions.includes('upload')}`);
      } else {
        console.log(`❌ No User Management permissions found`);
      }
    }
    
  }catch(error) {
    console.error('❌ Error debugging roles:', error);
  }
;

// Main execution
const main = async () => {
  try {
    await connectDB();
    await debugRoles();
    console.log('\n✅ Debug completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
};

// Run the script
main();