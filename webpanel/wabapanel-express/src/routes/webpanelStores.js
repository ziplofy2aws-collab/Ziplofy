const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { listStores, getStore, createStore } = require('../controllers/webpanelStoreController');
const {
  getStoreInformaticThemeConfig,
  saveStoreInformaticThemeConfig,
  resetStoreInformaticThemeConfig,
} = require('../controllers/webpanelInformaticThemeConfigController');
const {
  listStoreInformaticInstalledThemes,
  installInformaticThemeForStore,
  uninstallInformaticThemeForStore,
  applyInformaticThemeForStore,
} = require('../controllers/webpanelInformaticInstalledThemeController');
const {
  listStoreMedia,
  registerStoreMedia,
  proxyStoreMediaForEditor,
  deleteStoreMedia,
  deleteAllStoreMedia,
} = require('../controllers/webpanelStoreMediaController');
const {
  listStoreBlogs,
  createStoreBlog,
  getStoreBlog,
  updateStoreBlog,
  deleteStoreBlog,
  listStoreBlogPosts,
  createStoreBlogPost,
  getStoreBlogPost,
  updateStoreBlogPost,
  deleteStoreBlogPost,
} = require('../controllers/webpanelStoreBlogController');
const {
  listStorePages,
  createStorePage,
  getStorePageByHandle,
  getStorePage,
  updateStorePage,
  deleteStorePage,
} = require('../controllers/webpanelStorePageController');
const {
  listStoreMenus,
  createStoreMenu,
  getStoreMenu,
  updateStoreMenu,
  deleteStoreMenu,
} = require('../controllers/webpanelStoreMenuController');

router.use(protect);

router.get('/', listStores);
router.post('/', createStore);

router.get('/:storeId/informatic-installed-themes', listStoreInformaticInstalledThemes);
router.post('/:storeId/informatic-installed-themes/apply', applyInformaticThemeForStore);
router.post('/:storeId/informatic-installed-themes', installInformaticThemeForStore);
router.delete(
  '/:storeId/informatic-installed-themes/:installedThemeId',
  uninstallInformaticThemeForStore
);

router.get('/:storeId/media', listStoreMedia);
router.get('/:storeId/media/editor-proxy', proxyStoreMediaForEditor);
router.post('/:storeId/media/register', registerStoreMedia);
router.delete('/:storeId/media/all', deleteAllStoreMedia);
router.delete('/:storeId/media/:mediaId', deleteStoreMedia);

router.get('/:storeId/blogs', listStoreBlogs);
router.post('/:storeId/blogs', createStoreBlog);
router.get('/:storeId/blogs/:blogId', getStoreBlog);
router.put('/:storeId/blogs/:blogId', updateStoreBlog);
router.delete('/:storeId/blogs/:blogId', deleteStoreBlog);

router.get('/:storeId/blog-posts', listStoreBlogPosts);
router.post('/:storeId/blog-posts', createStoreBlogPost);
router.get('/:storeId/blog-posts/:postId', getStoreBlogPost);
router.put('/:storeId/blog-posts/:postId', updateStoreBlogPost);
router.delete('/:storeId/blog-posts/:postId', deleteStoreBlogPost);

router.get('/:storeId/pages', listStorePages);
router.post('/:storeId/pages', createStorePage);
router.get('/:storeId/pages/by-handle/:urlHandle', getStorePageByHandle);
router.get('/:storeId/pages/:pageId', getStorePage);
router.put('/:storeId/pages/:pageId', updateStorePage);
router.delete('/:storeId/pages/:pageId', deleteStorePage);

router.get('/:storeId/menus', listStoreMenus);
router.post('/:storeId/menus', createStoreMenu);
router.get('/:storeId/menus/:menuId', getStoreMenu);
router.put('/:storeId/menus/:menuId', updateStoreMenu);
router.delete('/:storeId/menus/:menuId', deleteStoreMenu);

const {
  listStorePolicies,
  getStorePolicy,
  upsertStorePolicy,
} = require('../controllers/webpanelStorePolicyController');

router.get('/:storeId/policies', listStorePolicies);
router.get('/:storeId/policies/:policyType', getStorePolicy);
router.put('/:storeId/policies/:policyType', upsertStorePolicy);

router.get('/:storeId/informatic-theme-config/:themeId', getStoreInformaticThemeConfig);
router.put('/:storeId/informatic-theme-config/:themeId', saveStoreInformaticThemeConfig);
router.delete('/:storeId/informatic-theme-config/:themeId', resetStoreInformaticThemeConfig);

router.get('/:id', getStore);

module.exports = router;
