const router = require('express').Router();
const {
  register,
  login,
  googleLogin,
  me,
  googleConfig,
  verifyEmailOtpHandler,
  resendEmailOtp,
} = require('../controllers/authController');
const { requirePlatformUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/verify-email-otp', verifyEmailOtpHandler);
router.post('/resend-email-otp', resendEmailOtp);
router.get('/google/config', googleConfig);
router.get('/me', requirePlatformUser, me);

module.exports = router;
