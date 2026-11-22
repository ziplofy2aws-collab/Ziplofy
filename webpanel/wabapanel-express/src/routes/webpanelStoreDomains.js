const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  listStoreDomains,
  connectDomain,
  verifyDomain,
  disconnectDomain,
} = require('../controllers/webpanelStoreDomainController');

router.use(protect);

router.get('/store/:storeId', listStoreDomains);
router.post('/connect', connectDomain);
router.post('/verify', verifyDomain);
router.delete('/:id', disconnectDomain);

module.exports = router;
