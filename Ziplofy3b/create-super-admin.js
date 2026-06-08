const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User } = require('./build/models/user.model');
const { Role } = require('./build/models/role.model');

async function createSuperAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ziplofy');
    console.log('Connected to database');

    // Find or create super-admin role
    let superAdminRole = await Role.findOne({ name: 'super-admin' });
    
    if (!superAdminRole) {
      console.log('Creating super-admin role...');
      superAdminRole = await Role.create({
        name: 'super-admin',
        description: 'Full system access with all permissions',
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
      });
      console.log('Super-admin role created');
    } else {
      console.log('Super-admin role already exists');
    }

    // Check if super admin user already exists
    const existingUser = await User.findOne({ email: 'shubham2105834@gmail.com' });
    
    if (existingUser) {
      console.log('Super admin user already exists with email: shubham2105834@gmail.com');
      console.log('Updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash('1234567', 10);
      existingUser.password = hashedPassword;
      existingUser.role = superAdminRole._id;
      existingUser.status = 'active';
      await existingUser.save();
      
      console.log('Super admin user updated successfully!');
    } else {
      console.log('Creating super admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('1234567', 10);
      
      // Create super admin user
      const superAdmin = await User.create({
        name: 'Shubham Super Admin',
        email: 'shubham2105834@gmail.com',
        password: hashedPassword,
        role: superAdminRole._id,
        status: 'active',
        lastLogin: null,
        assignedSupportDeveloperId: null
      });
      
      console.log('Super admin user created successfully!');
      console.log('Email: shubham2105834@gmail.com');
      console.log('Password: 1234567');
    }

    console.log('\n✅ Super admin user is ready!');
    console.log('You can now login with:');
    console.log('Email: shubham2105834@gmail.com');
    console.log('Password: 1234567');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

// Run the function
createSuperAdmin();
