const router = require('express').Router();
const { requirePlatformUser } = require('../middleware/auth');
const {
  saveService,
  saveIndustry,
  saveBusinessName,
  complete,
} = require('../controllers/onboardingController');
const { ECOMMERCE_INDUSTRIES, SERVICE_INDUSTRIES } = require('../utils/industries');

router.use(requirePlatformUser);
router.get('/industries', (_req, res) => {
  res.json({ success: true, ecommerce: ECOMMERCE_INDUSTRIES, service: SERVICE_INDUSTRIES });
});
router.put('/service', saveService);
router.put('/industry', saveIndustry);
router.put('/business-name', saveBusinessName);
router.post('/complete', complete);

module.exports = router;
