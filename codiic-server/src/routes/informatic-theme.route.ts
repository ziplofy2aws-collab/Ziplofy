import { Router } from 'express';
import {
  createInformaticThemeFromS3,
  deleteInformaticTheme,
  getInformaticTheme,
  getInformaticThemeEditorPack,
  getInformaticThemePreview,
  listInformaticThemes,
  serveInformaticThemePreviewFiles,
} from '../controllers/informatic-theme.controller';
import { authorizePermission, protect } from '../middlewares/auth.middleware';

export const informaticThemeRouter = Router();

/** Public catalog for webpanel + storefront pickers */
informaticThemeRouter.get('/', listInformaticThemes);
informaticThemeRouter.get('/preview/:id', getInformaticThemePreview);
informaticThemeRouter.get('/preview/:id/*', serveInformaticThemePreviewFiles);
informaticThemeRouter.get('/:id/editor-pack', getInformaticThemeEditorPack);
informaticThemeRouter.get('/:id', getInformaticTheme);

informaticThemeRouter.use(protect);

informaticThemeRouter.post(
  '/from-s3',
  authorizePermission('Theme Management', 'upload'),
  createInformaticThemeFromS3
);

informaticThemeRouter.delete(
  '/:id',
  authorizePermission('Theme Management', 'edit'),
  deleteInformaticTheme
);

export default informaticThemeRouter;
