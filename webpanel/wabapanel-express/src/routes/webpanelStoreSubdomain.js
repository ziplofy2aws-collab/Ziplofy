const express = require('express');
const { checkStoreSubdomain } = require('../controllers/webpanelStoreController');

const router = express.Router();

/** Public — used by webpanel-store-renderer to resolve Host → store */
router.get('/check', checkStoreSubdomain);

module.exports = router;
