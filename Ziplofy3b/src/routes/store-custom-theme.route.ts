import { Router } from 'express';
import {
  createStoreCustomTheme,
  deleteStoreCustomTheme,
  getStoreCustomThemesByStoreId,
  updateStoreCustomTheme,
} from '../controllers/store-custom-theme.controller';
import { protect } from '../middlewares/auth.middleware';

const storeCustomThemeRouter = Router();

storeCustomThemeRouter.use(protect);

/** GET /api/store-custom-themes/store/:storeId */
storeCustomThemeRouter.get('/store/:storeId', getStoreCustomThemesByStoreId);

/** POST /api/store-custom-themes */
storeCustomThemeRouter.post('/', createStoreCustomTheme);

/** PUT /api/store-custom-themes/:id */
storeCustomThemeRouter.put('/:id', updateStoreCustomTheme);

/** DELETE /api/store-custom-themes/:id */
storeCustomThemeRouter.delete('/:id', deleteStoreCustomTheme);

export default storeCustomThemeRouter;
