require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('Testing JWT...');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_SECRET type:', typeof process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');

try {
  const token = jwt.sign(
    { 
      userId: 'test123', 
      email: 'test@example.com',
      role: 'super-admin',
      isSuperAdmin: true 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log('JWT token created successfully!');
  console.log('Token length:', token.length);
} catch (error) {
  console.error('JWT error:', error.message);
}
