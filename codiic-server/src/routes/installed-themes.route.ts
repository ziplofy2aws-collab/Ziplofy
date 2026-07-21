import { Router } from 'express';
import { installThemeForStore, getInstalledThemesByStore, uninstallThemeForStore } from '../controllers/installed-themes.controller';
import { protect } from '../middlewares/auth.middleware';

export const installedThemesRouter = Router();

installedThemesRouter.use(protect);

// POST /api/installed-themes/install
installedThemesRouter.post('/', installThemeForStore);

// GET /api/installed-themes/store/:storeId
installedThemesRouter.get('/store/:storeId', getInstalledThemesByStore);

// DELETE /api/installed-themes/uninstall
installedThemesRouter.delete('/:installedThemeId', uninstallThemeForStore);


