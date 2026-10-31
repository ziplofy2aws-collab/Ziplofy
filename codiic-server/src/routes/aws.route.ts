import { Router } from 'express';
import express from 'express';
import {
  deleteImagesFromS3,
  generateImageUploadSignedUrl,
  generateThemeUploadSignedUrl,
  localDiskUpload,
} from '../controllers/aws.controller';
import { authorizePermission, protect } from '../middlewares/auth.middleware';

const awsRouter = Router();

// Dev-only disk sink — no auth (the browser's presigned PUT carries no token);
// the handler itself 404s when real AWS creds are configured.
awsRouter.put('/local-upload', express.raw({ type: () => true, limit: '100mb' }), localDiskUpload);

awsRouter.use(protect);
awsRouter.post('/signed-url/image', generateImageUploadSignedUrl);
awsRouter.post('/signed-url/theme-asset',
  authorizePermission('Theme Management', 'upload'),
  generateThemeUploadSignedUrl
);
awsRouter.post('/delete-images', deleteImagesFromS3);

export default awsRouter;
