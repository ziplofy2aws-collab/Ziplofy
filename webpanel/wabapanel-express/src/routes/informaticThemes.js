const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  listInformaticThemes,
  getInformaticTheme,
  getInformaticThemeEditorPack,
  getInformaticThemePreview,
  getInformaticThemePreviewAsset,
} = require('../controllers/informaticThemeController');

/** Public catalog preview (iframe — no auth header). */
router.get('/preview/:id', getInformaticThemePreview);
router.get('/preview/:id/*path', getInformaticThemePreviewAsset);

router.use(protect);

router.get('/', listInformaticThemes);
router.get('/:id/editor-pack', getInformaticThemeEditorPack);
router.get('/:id', getInformaticTheme);

module.exports = router;
