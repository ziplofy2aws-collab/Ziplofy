require('dotenv').config();
const express = require('express');
const app = express();

app.get('/debug-env', (req, res) => {
  res.json({
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_TYPE: typeof process.env.JWT_SECRET,
    JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined',
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT
  });
});

app.listen(3001, () => {
  console.log('Debug server running on port 3001');
});
