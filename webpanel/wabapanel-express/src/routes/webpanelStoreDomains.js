const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  listStoreDomains,
  connectDomain,
  verifyDomain,
  disconnectDomain,
  retryDomainSsl,
} = require('../controllers/webpanelStoreDomainController');

router.use(protect);

router.get('/store/:storeId', listStoreDomains);
router.post('/connect', connectDomain);
router.post('/verify', verifyDomain);
router.post('/:id/ssl/retry', retryDomainSsl);
router.delete('/:id', disconnectDomain);

module.exports = router;
