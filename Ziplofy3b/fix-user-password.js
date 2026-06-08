whatconst mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User } = require('./build/models/user.model');

async function fixUserPassword() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ziplofy');
    console.log('Connected to database');

    // Find the user
    const user = await User.findOne({ email: 'shubham2105834@gmail.com' });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found, updating password...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('1234567', 10);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password updated successfully!');
    console.log('User details:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Status:', user.status);
    console.log('- Password exists:', !!user.password);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user password:', error);
    process.exit(1);
  }
}

fixUserPassword();
