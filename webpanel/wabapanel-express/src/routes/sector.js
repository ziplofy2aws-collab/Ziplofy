const express = require('express');
const router = express.Router();
const { protect, workspaceAccess } = require('../middleware/auth');
const { requireFeature } = require('../middleware/featureGate');
const { entityFor, INDUSTRIES } = require('../utils/industryConfig');
const {
  listEntities, listRecords, getRecord, createRecord, updateRecord, archiveRecord,
  setStatus, duplicateRecord, convertEnquiry, overview,
} = require('../controllers/sectorController');

router.use(protect, workspaceAccess);

// Gate each request on the industry's sector feature key (realEstate, agency, ...)
const industryGate = (req, res, next) => {
  const industry = String(req.params.industry || '');
  const info = INDUSTRIES[industry];
  if (!info || !info.sector) {
    return res.status(404).json({ success: false, message: 'Unknown industry' });
  }
  return requireFeature(info.sector)(req, res, next);
};

router.get('/:industry/entities', industryGate, listEntities);
router.get('/:industry/overview', industryGate, overview);
router.get('/:industry/:entity', industryGate, (req, res, next) => {
  if (!entityFor(req.params.industry, req.params.entity)) {
    return res.status(404).json({ success: false, message: 'Unknown entity' });
  }
  next();
}, listRecords);
router.post('/:industry/enquiries/:id/convert', industryGate, convertEnquiry);
router.post('/:industry/:entity/:id/status', industryGate, setStatus);
router.post('/:industry/:entity/:id/duplicate', industryGate, duplicateRecord);
router.get('/:industry/:entity/:id', industryGate, getRecord);
router.post('/:industry/:entity', industryGate, createRecord);
router.put('/:industry/:entity/:id', industryGate, updateRecord);
router.delete('/:industry/:entity/:id', industryGate, archiveRecord);

module.exports = router;
