import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { InstalledThemes } from '../models/installed-themes.model';
import { Theme } from '../models/theme.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { listInstalledThemesForStore } from '../utils/installed-themes-list.util';

export const installThemeForStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, themeId } = req.body as { storeId: string; themeId: string };
  if (!storeId || !themeId) throw new CustomError('storeId and themeId are required', 400);

  const validTheme = await Theme.findById(themeId);
  if (!validTheme) throw new CustomError('Theme not found', 404);

  await InstalledThemes.findOneAndUpdate(
    { store: new mongoose.Types.ObjectId(storeId), theme: new mongoose.Types.ObjectId(themeId) },
    {
      $set: {
        store: new mongoose.Types.ObjectId(storeId),
        theme: new mongoose.Types.ObjectId(themeId),
        uninstalledAt: null,
        installedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const data = await listInstalledThemesForStore(storeId);
  return res.status(200).json({ success: true, data });
});

export const getInstalledThemesByStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId) throw new CustomError('storeId is required', 400);

  const data = await listInstalledThemesForStore(storeId);
  return res.status(200).json({ success: true, data });
});

// Uninstall (deactivate) theme for a store
export const uninstallThemeForStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const installedThemeId = req.params.installedThemeId;
  if (!installedThemeId) throw new CustomError('installedThemeId is required', 400);

  const deleted = await InstalledThemes.findByIdAndDelete(new mongoose.Types.ObjectId(installedThemeId));
  if (!deleted) throw new CustomError('Installed theme not found', 404);

  return res.status(200).json({ success: true, message: 'Theme uninstalled for store', data: deleted });    
});
