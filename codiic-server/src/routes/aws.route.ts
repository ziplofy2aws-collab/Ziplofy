import { Router } from 'express';
import {
  deleteImagesFromS3,
  generateImageUploadSignedUrl,
  generateThemeUploadSignedUrl,
} from '../controllers/aws.controller';
import { authorizePermission, protect } from '../middlewares/auth.middleware';

const awsRouter = Router();

awsRouter.use(protect);
awsRouter.post('/signed-url/image', generateImageUploadSignedUrl);
awsRouter.post('/signed-url/theme-asset',
  authorizePermission('Theme Management', 'upload'),
  generateThemeUploadSignedUrl
);
awsRouter.post('/delete-images', deleteImagesFromS3);

export default awsRouter;
