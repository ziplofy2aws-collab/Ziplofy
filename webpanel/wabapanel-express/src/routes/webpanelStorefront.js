const express = require('express');
const {
  getStorefrontInformaticThemeRuntime,
} = require('../controllers/webpanelStorefrontInformaticController');
const {
  listStorefrontBlogs,
  listStorefrontBlogPosts,
  getStorefrontBlogPostBySlug,
} = require('../controllers/webpanelStorefrontBlogController');
const {
  listStorefrontPages,
  getStorefrontPageByHandle,
} = require('../controllers/webpanelStorefrontPageController');
const {
  listStorefrontMenus,
  getStorefrontMenuByHandle,
  getStorefrontMenuById,
} = require('../controllers/webpanelStorefrontMenuController');
const {
  getStorefrontPolicies,
  getStorefrontPolicyByType,
} = require('../controllers/webpanelStorefrontPolicyController');
const {
  createStorefrontContactSubmission,
} = require('../controllers/webpanelStorefrontContactController');
const {
  getStorefrontLeadGenForm,
  submitStorefrontLeadGenForm,
} = require('../controllers/webpanelStorefrontLeadGenFormController');

const router = express.Router();

/** Public — no auth; used by webpanel-store-renderer */
router.get('/:storeId/informatic-theme-runtime', getStorefrontInformaticThemeRuntime);
router.get('/:storeId/blogs', listStorefrontBlogs);
router.get('/:storeId/blog-posts', listStorefrontBlogPosts);
router.get('/:storeId/blog-posts/by-slug/:slug', getStorefrontBlogPostBySlug);
router.get('/:storeId/pages', listStorefrontPages);
router.get('/:storeId/pages/by-handle/:urlHandle', getStorefrontPageByHandle);
router.get('/:storeId/menus', listStorefrontMenus);
router.get('/:storeId/menus/by-handle/:handle', getStorefrontMenuByHandle);
router.get('/:storeId/menus/:menuId', getStorefrontMenuById);
router.get('/:storeId/policies', getStorefrontPolicies);
router.get('/:storeId/policies/:policyType', getStorefrontPolicyByType);
router.post('/:storeId/contact-form-submissions', createStorefrontContactSubmission);
router.get('/:storeId/lead-gen-forms/:formId', getStorefrontLeadGenForm);
router.post('/:storeId/lead-gen-forms/:formId/submit', submitStorefrontLeadGenForm);

module.exports = router;
