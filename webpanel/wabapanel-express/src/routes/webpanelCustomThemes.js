const { protect } = require('../middleware/auth');
const {
  updateStoreCustomTheme,
  deleteStoreCustomTheme,
} = require('../controllers/webpanelStoreCustomThemeController');

const router = require('express').Router();

router.use(protect);

router.put('/:id', updateStoreCustomTheme);
router.delete('/:id', deleteStoreCustomTheme);

module.exports = router;
