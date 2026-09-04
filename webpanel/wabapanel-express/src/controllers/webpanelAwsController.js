const s3Service = require('../services/s3Service');

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

function extractS3KeyFromUrl(imageUrl) {
  try {
    const parsed = new URL(imageUrl);
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    return key || null;
  } catch {
    return null;
  }
}

/** GET /api/aws/status — whether S3 presigned uploads are available */
const getAwsUploadStatus = async (_req, res) => {
  const configured = s3Service.isConfigured();
  const meta = s3Service.getMeta();
  res.json({
    success: true,
    data: {
      configured,
      bucket: meta.bucket,
      region: meta.region,
    },
  });
};

/** POST /api/aws/signed-url/image */
const generateImageUploadSignedUrl = async (req, res) => {
  try {
    const { fileName, fileType, folder, expiresInSeconds } = req.body || {};
    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ success: false, message: 'fileName is required' });
    }
    if (!fileType || typeof fileType !== 'string') {
      return res.status(400).json({ success: false, message: 'fileType is required' });
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported fileType. Only image MIME types are allowed.',
      });
    }

    const data = await s3Service.generateUploadSignedUrl({
      fileName,
      fileType,
      folder: typeof folder === 'string' && folder.trim() ? folder.trim() : 'uploads/images',
      expiresInSeconds,
    });

    res.json({ success: true, message: 'Signed URL generated', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to generate signed URL',
    });
  }
};

/** POST /api/aws/delete-images */
const deleteImagesFromS3 = async (req, res) => {
  try {
    const imageUrls = Array.isArray(req.body?.imageUrls) ? req.body.imageUrls : [];
    const imageKeys = Array.isArray(req.body?.imageKeys) ? req.body.imageKeys : [];

    const keysFromUrls = imageUrls
      .map((url) => (typeof url === 'string' ? extractS3KeyFromUrl(url.trim()) : null))
      .filter(Boolean);
    const keys = Array.from(
      new Set([
        ...imageKeys.map((k) => String(k).trim()).filter(Boolean),
        ...keysFromUrls,
      ])
    );

    if (!keys.length) {
      return res.status(400).json({
        success: false,
        message: 'Provide a non-empty imageKeys or imageUrls array',
      });
    }

    const data = await s3Service.deleteObjects(keys);
    res.json({ success: true, message: 'Images deleted from S3', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete images from S3',
    });
  }
};

module.exports = {
  getAwsUploadStatus,
  generateImageUploadSignedUrl,
  deleteImagesFromS3,
};
