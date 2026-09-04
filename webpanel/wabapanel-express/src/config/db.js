const mongoose = require('mongoose');

function redactMongoUri(uri) {
  if (!uri) return '(not set)';
  return String(uri).replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@');
}

const connectDB = async () => {
  try {
    const uri = (process.env.MONGODB_URI || '').trim() || 'mongodb://127.0.0.1:27017/wabapanel';
    console.log(`[DB] Connecting to ${redactMongoUri(uri)}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      // Render/Heroku often fail Atlas over IPv6; force IPv4.
      family: 4,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    console.error('[DB] Check: Atlas Network Access (0.0.0.0/0), MONGODB_URI on Render (no quotes/spaces), cluster not paused, DB user password URL-encoded if it has special chars.');
    process.exit(1);
  }
};

module.exports = connectDB;
