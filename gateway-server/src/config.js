require('dotenv').config();

function trimSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

const config = {
  port: Number(process.env.PORT || 3011),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codiic',
  jwtSecret: process.env.GATEWAY_JWT_SECRET || 'dev-gateway-jwt-secret-change-me',
  ssoSecret: process.env.GATEWAY_SSO_SECRET || 'dev-gateway-sso-secret-change-me',
  jwtExpiresIn: process.env.GATEWAY_JWT_EXPIRE || '7d',
  googleClientId: String(process.env.GOOGLE_CLIENT_ID || '').trim(),
  corsOrigins: String(process.env.CORS_ORIGINS || 'http://localhost:3010')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  codiicApiUrl: trimSlash(process.env.CODIIC_API_URL || 'http://127.0.0.1:5000/api'),
  webpanelApiUrl: trimSlash(process.env.WEBPANEL_API_URL || 'http://127.0.0.1:5001/api'),
  codiicDashboardUrl: trimSlash(process.env.CODIIC_DASHBOARD_URL || 'http://localhost:3000'),
  webpanelAppUrl: trimSlash(process.env.WEBPANEL_APP_URL || 'http://localhost:3002'),
};

module.exports = config;
