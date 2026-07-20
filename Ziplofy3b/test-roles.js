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

// Test the updated roles
const testRoles = async () => {
  try {
    console.log('🧪 Testing updated roles...');
    
    // Get the roles collection directly
    const db = mongoose.connection.db;
    const rolesCollection = db.collection('roles');
    
    // Get all roles
    const roles = await rolesCollection.find({}).toArray();
    console.log(`\n📊 Found ${roles.length} roles:`);
    
    for (const role of roles) {
      console.log(`\n🔍 Role: ${role.name}`);
      console.log(`   isSuperAdmin: ${role.isSuperAdmin}`);
      console.log(`   Permissions count: ${role.permissions ? role.permissions.length : 0}`);
      
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(perm => {
          console.log(`   - ${perm.section}: [${perm.permissions.join(', ')}]`);
        });
      } else {
        console.log('   - No permissions found');
      }
    }
    
    console.log('\n✅ Roles test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing roles:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await testRoles();
    console.log('\n🎉 Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
