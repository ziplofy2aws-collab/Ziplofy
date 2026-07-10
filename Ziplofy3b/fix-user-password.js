const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User } = require('./build/models/user.model');

async function fixUserPassword() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codiic');
    console.log('Connected to database');

    // Find the user
    const user = await User.findOne({ email: 'shubham2105834@gmail.com' });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found, updating password...');
    
    // Plain password — User model pre-save hook handles hashing
    user.password = '12345678';
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
