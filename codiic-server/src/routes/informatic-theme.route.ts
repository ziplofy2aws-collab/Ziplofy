import { Router } from 'express';
import multer from 'multer';
import {
  createInformaticThemeFromS3,
  deleteInformaticTheme,
  getInformaticTheme,
  getInformaticThemeEditorPack,
  getInformaticThemePreview,
  importInformaticThemeFolder,
  importInformaticThemeZip,
  listInformaticThemes,
  serveInformaticThemeFile,
  serveInformaticThemePreviewFiles,
} from '../controllers/informatic-theme.controller';
import { authorizePermission, protect } from '../middlewares/auth.middleware';

export const informaticThemeRouter = Router();

const informaticZipUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /\.zip$/i.test(file.originalname) ||
      ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'].includes(
        file.mimetype
      );
    if (ok) cb(null, true);
    else cb(new Error('Only .zip theme packages are accepted'));
  },
});

/** Public catalog for webpanel + storefront pickers */
informaticThemeRouter.get('/', listInformaticThemes);
informaticThemeRouter.get('/preview/:id', getInformaticThemePreview);
informaticThemeRouter.get('/preview/:id/*', serveInformaticThemePreviewFiles);
informaticThemeRouter.get('/file/:id/*', serveInformaticThemeFile);
informaticThemeRouter.get('/:id/editor-pack', getInformaticThemeEditorPack);
informaticThemeRouter.get('/:id', getInformaticTheme);

informaticThemeRouter.use(protect);

informaticThemeRouter.post(
  '/from-s3',
  authorizePermission('Theme Management', 'upload'),
  createInformaticThemeFromS3
);

informaticThemeRouter.post(
  '/import-zip',
  authorizePermission('Theme Management', 'upload'),
  informaticZipUpload.single('file'),
  importInformaticThemeZip
);

const informaticFolderUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 500 },
});

informaticThemeRouter.post(
  '/import-folder',
  authorizePermission('Theme Management', 'upload'),
  informaticFolderUpload.array('files', 500),
  importInformaticThemeFolder
);

informaticThemeRouter.delete(
  '/:id',
  authorizePermission('Theme Management', 'edit'),
  deleteInformaticTheme
);

export default informaticThemeRouter;
