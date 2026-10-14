const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

function signAccessToken(user) {
  return jwt.sign(
    {
      uid: user._id.toString(),
      email: user.email,
      role: 'platform',
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function mintSsoTicket({ platformUserId, destination, productUserId, launchPath }) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      typ: 'gateway-sso',
      jti,
      dest: destination,
      productUserId,
      platformUserId,
      launchPath,
    },
    config.ssoSecret,
    { expiresIn: 60 }
  );
  return { token, jti };
}

function verifySsoTicket(token) {
  return jwt.verify(token, config.ssoSecret);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  mintSsoTicket,
  verifySsoTicket,
};
