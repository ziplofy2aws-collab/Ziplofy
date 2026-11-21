const router = require("express").Router();
const { protect, workspaceAccess } = require("../middleware/auth");
const { handleEmbeddedSignup, getEmbeddedSignupConfig, updateMetaAppConfig, getOAuthUrl, oauthCallback, getConnectionStatus, disconnectWhatsApp } = require("../controllers/embeddedSignupController");

// PUBLIC: Meta redirects the browser here after the OAuth dialog.
router.get("/callback", oauthCallback);

router.use(protect);
router.use(workspaceAccess);

router.get("/config", getEmbeddedSignupConfig);
router.get("/oauth-url", getOAuthUrl);
router.get("/status", getConnectionStatus);
router.post("/signup", handleEmbeddedSignup);
router.post("/disconnect", disconnectWhatsApp);

module.exports = router;
