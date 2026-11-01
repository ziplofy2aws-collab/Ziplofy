const mongoose = require('mongoose');

function redactMongoUri(uri) {
  if (!uri) return '(not set)';
  return String(uri).replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@');
}

const connectDB = async () => {
  try {
    let uri = (process.env.MONGODB_URI || '').trim();
    if (process.env.NODE_ENV === 'production') {
      // Never silently fall back to localhost in production — a missing or
      // mis-set MONGODB_URI previously booted the API against an empty local db.
      if (!uri) {
        console.error('[DB] FATAL: MONGODB_URI is not set (NODE_ENV=production). Refusing to fall back to localhost.');
        process.exit(1);
      }
      if (/127\.0\.0\.1|localhost/.test(uri)) {
        console.error(`[DB] FATAL: MONGODB_URI points at localhost in production (${redactMongoUri(uri)}).`);
        process.exit(1);
      }
    } else if (!uri) {
      uri = 'mongodb://127.0.0.1:27017/wabapanel';
    }
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
