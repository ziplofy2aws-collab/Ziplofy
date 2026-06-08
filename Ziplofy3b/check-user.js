const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User } = require('./build/models/user.model');

async function checkUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ziplofy');
    console.log('Connected to database');

    // Check if user exists
    const user = await User.findOne({ email: 'shubham2105834@gmail.com' });
    
    if (user) {
      console.log('User found:');
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Status:', user.status);
      console.log('- Role:', user.role);
      console.log('- Password exists:', !!user.password);
      console.log('- Password length:', user.password ? user.password.length : 'N/A');
    } else {
      console.log('User not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
}

checkUser();
