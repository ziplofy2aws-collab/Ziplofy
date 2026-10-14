const { verifyAccessToken } = require('../utils/jwt');
const PlatformUser = require('../models/PlatformUser');

async function requirePlatformUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = verifyAccessToken(token);
    const user = await PlatformUser.findById(decoded.uid);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    req.platformUser = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

module.exports = { requirePlatformUser };
