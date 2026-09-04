const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = path.join(__dirname, '..', '..');
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const envPath = path.join(root, `.env.${env}`);

if (fs.existsSync(envPath)) {
  const parsed = dotenv.parse(fs.readFileSync(envPath));
  for (const [key, value] of Object.entries(parsed)) {
    const current = process.env[key];
    // Render/other hosts may define empty placeholders — treat those as unset.
    if (current === undefined || String(current).trim() === '') {
      process.env[key] = value;
    }
  }
}

// Inherit AWS S3 creds from codiic-server when not set locally (shared bucket for media/preview).
const codiicEnvPath = path.join(root, '..', '..', 'codiic-server', `.env.${env}`);
if (fs.existsSync(codiicEnvPath)) {
  const parsed = dotenv.parse(fs.readFileSync(codiicEnvPath));
  for (const key of [
    'AWS_REGION',
    'AWS_S3_BUCKET',
    'AWS_S3_BUCKET_NAME',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ]) {
    const current = process.env[key];
    if ((current === undefined || String(current).trim() === '') && parsed[key]) {
      process.env[key] = parsed[key];
    }
  }
  // Normalize bucket alias
  if (!process.env.AWS_S3_BUCKET && process.env.AWS_S3_BUCKET_NAME) {
    process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
  }
  if (!process.env.AWS_S3_BUCKET_NAME && process.env.AWS_S3_BUCKET) {
    process.env.AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET;
  }
}

function redactMongoUri(uri) {
  if (!uri) return '(not set — will fall back to localhost)';
  return String(uri).replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@');
}

if (process.env.NODE_ENV === 'production') {
  console.log(`[Env] NODE_ENV=production, env file=${envPath}`);
  console.log(`[Env] MONGODB_URI=${redactMongoUri(process.env.MONGODB_URI)}`);
}

module.exports = env;
