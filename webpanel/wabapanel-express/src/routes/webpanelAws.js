const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getAwsUploadStatus,
  generateImageUploadSignedUrl,
  deleteImagesFromS3,
} = require('../controllers/webpanelAwsController');

router.use(protect);

router.get('/status', getAwsUploadStatus);
router.post('/signed-url/image', generateImageUploadSignedUrl);
router.post('/delete-images', deleteImagesFromS3);

module.exports = router;
