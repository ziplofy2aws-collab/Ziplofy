const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const {
  register, login, googleLogin, googleAuthConfig, adminLogin, getMe, updateProfile,
  changePassword, forgotPassword, resetPassword, resetPasswordFromBody, switchWorkspace,
  verifyEmail, resendVerification,
  loginVerify2FA, resendLoginOTP,
  get2FAStatus, setup2FA, verify2FA, resendSetupOTP, disable2FA,
} = require('../controllers/authController');

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const OTP_WINDOW_MS = 10 * 60 * 1000;

const limitHandler = (req, res) => {
  res.setHeader('Retry-After', String(Math.ceil(LOGIN_WINDOW_MS / 1000)));
  return res.status(429).json({
    success: false,
    code: 'LOGIN_BLOCKED',
    retryAfterSec: Math.ceil(LOGIN_WINDOW_MS / 1000),
    message: 'Too many failed attempts. For security your login is temporarily blocked. It will unlock automatically in about 5 minutes, or reset your password to unblock now.',
  });
};
const otpLimitHandler = (req, res) => {
  res.setHeader('Retry-After', String(Math.ceil(OTP_WINDOW_MS / 1000)));
  return res.status(429).json({
    success: false,
    code: 'AUTH_RATE_LIMITED',
    retryAfterSec: Math.ceil(OTP_WINDOW_MS / 1000),
    message: 'Too many requests. Please try again after some time.',
  });
};
// IPv6-safe IP normaliser (express-rate-limit >=7 requires this for custom key
// generators; guarded so it also works on older versions without the helper).
const ipKeyGen = typeof rateLimit.ipKeyGenerator === 'function' ? rateLimit.ipKeyGenerator : (ip) => String(ip);
const loginKey = (req) =>
  ipKeyGen(String(req.headers['x-real-ip'] || req.ip || 'ip')) +
  '|' +
  String((req.body && req.body.email) || '')
    .trim()
    .toLowerCase();

// Brute-force protection for credential/token checks. Only FAILED attempts count,
// so legitimate users who log in successfully are never throttled.
const loginLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: loginKey,
  handler: limitHandler,
  validate: { keyGeneratorIpFallback: false },
});

// Anti-abuse for endpoints that send email / OTP or create accounts.
// Successful signups/resets should not burn the quota — only abuse attempts.
const otpLimiter = rateLimit({
  windowMs: OTP_WINDOW_MS,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: otpLimitHandler,
});

router.post('/register', otpLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/google', loginLimiter, googleLogin);
router.get('/google/config', googleAuthConfig);
router.post('/admin/login', loginLimiter, adminLogin);
router.post('/admin-login', loginLimiter, adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-email', loginLimiter, verifyEmail);
router.post('/resend-verification', otpLimiter, resendVerification);
router.post('/reset-password', loginLimiter, resetPasswordFromBody);
router.put('/reset-password/:token', loginLimiter, resetPassword);
router.put('/switch-workspace/:workspaceId', protect, switchWorkspace);

// 2FA — login challenge (public)
router.post('/2fa/login-verify', loginLimiter, loginVerify2FA);
router.post('/2fa/login-resend', otpLimiter, resendLoginOTP);

// 2FA — management (logged in)
router.get('/2fa/status', protect, get2FAStatus);
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/resend', protect, resendSetupOTP);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;
