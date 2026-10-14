const router = require('express').Router();
const { register, login, googleLogin, me, googleConfig } = require('../controllers/authController');
const { requirePlatformUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/google/config', googleConfig);
router.get('/me', requirePlatformUser, me);

module.exports = router;
