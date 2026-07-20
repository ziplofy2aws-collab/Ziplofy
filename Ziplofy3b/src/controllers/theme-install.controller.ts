// @ts-nocheck
import { Request, Response } from 'express';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { cloneThemeToStore, getInstalledThemes, updateThemeCustomization } from '../utils/theme-clone.utils';
import { Theme } from '../models/theme.model';
import { Store } from '../models/store/store.model';
import { InstalledThemes } from '../models/installed-themes.model';

/**
 * Install theme to client's store
 */
export const installTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId, storeId } = req.body;
  const clientId = (req as any).user?.id; // Assuming user ID is available in req.user

  if (!themeId || !storeId) {
    throw new CustomError('Theme ID and Store ID are required', 400);
  }

  // Verify theme exists
  const theme = await Theme.findById(themeId);
  if (!theme) {
    throw new CustomError('Theme not found', 404);
  }

  // Verify store belongs to client
  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  if (store.userId.toString() !== clientId) {
    throw new CustomError('Unauthorized: Store does not belong to client', 403);
  }

  // Check if theme is already installed
  const existingInstallation = await InstalledThemes.findOne({
    themeId,
    storeId,
    status: 'installed'
  });

  if (existingInstallation) {
    throw new CustomError('Theme is already installed in this store', 400);
  }

  try {
    // Clone theme to client's store
    const clonedThemePath = await cloneThemeToStore(themeId, clientId, storeId);

    // Create installation record in database
    const installation = await InstalledThemes.create({
      themeId,
      storeId,
      clientId,
      status: 'installed',
      installedAt: new Date(),
      themePath: clonedThemePath,
      customizations: []
    });

    // Update theme installation count
    await Theme.findByIdAndUpdate(themeId, {
      $inc: { installationCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Theme installed successfully',
      data: {
        installationId: installation._id,
        themeId,
        storeId,
        themePath: clonedThemePath,
        installedAt: installation.installedAt
      }
    });
  } catch (error) {
    throw new CustomError(`Failed to install theme: ${error}`, 500);
  }
});

/**
 * Get installed themes for a client's store
 */
export const getClientInstalledThemes = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const clientId = (req as any).user?.id;

  if (!storeId) {
    throw new CustomError('Store ID is required', 400);
  }

  // Verify store belongs to client
  const store = await Store.findById(storeId);
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  if (store.userId.toString() !== clientId) {
    throw new CustomError('Unauthorized: Store does not belong to client', 403);
  }

  try {
    // Get installed themes from database
    const installedThemes = await InstalledThemes.find({
      storeId,
      status: 'installed'
    }).populate('themeId', 'name description previewImage category');

    // Get additional file system information
    const themesWithDetails = await Promise.all(
      installedThemes.map(async (installation) => {
        try {
          const fileSystemThemes = await getInstalledThemes(clientId, storeId);
          const fileSystemTheme = fileSystemThemes.find(t => t.themeId === installation.themeId.toString());
          
          return {
            ...installation.toObject(),
            fileSystemInfo: fileSystemTheme || null
          };
        } catch (error) {
          return installation.toObject();
        }
      })
    );

    res.status(200).json({
      success: true,
      data: themesWithDetails
    });
  } catch (error) {
    throw new CustomError(`Failed to get installed themes: ${error}`, 500);
  }
});

/**
 * Uninstall theme from client's store
 */
export const uninstallTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const clientId = (req as any).user?.id;

  if (!installationId) {
    throw new CustomError('Installation ID is required', 400);
  }

  // Find installation record
  const installation = await InstalledThemes.findById(installationId);
  if (!installation) {
    throw new CustomError('Theme installation not found', 404);
  }

  // Verify client owns this installation
  if (installation.clientId.toString() !== clientId) {
    throw new CustomError('Unauthorized: You do not own this theme installation', 403);
  }

  try {
    // Update installation status
    await InstalledThemes.findByIdAndUpdate(installationId, {
      status: 'uninstalled',
      uninstalledAt: new Date()
    });

    // Update theme installation count
    await Theme.findByIdAndUpdate(installation.themeId, {
      $inc: { installationCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Theme uninstalled successfully'
    });
  } catch (error) {
    throw new CustomError(`Failed to uninstall theme: ${error}`, 500);
  }
});

/**
 * Update theme customization
 */
export const updateTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const { customization } = req.body;
  const clientId = (req as any).user?.id;

  if (!installationId) {
    throw new CustomError('Installation ID is required', 400);
  }

  if (!customization) {
    throw new CustomError('Customization data is required', 400);
  }

  // Find installation record
  const installation = await InstalledThemes.findById(installationId);
  if (!installation) {
    throw new CustomError('Theme installation not found', 404);
  }

  // Verify client owns this installation
  if (installation.clientId.toString() !== clientId) {
    throw new CustomError('Unauthorized: You do not own this theme installation', 403);
  }

  try {
    // Update customization in database
    await InstalledThemes.findByIdAndUpdate(installationId, {
      $push: { customizations: { ...customization, updatedAt: new Date() } }
    });

    // Update file system customization
    await updateThemeCustomization(
      installation.storeId.toString(),
      installation.themeId.toString(),
      customization
    );

    res.status(200).json({
      success: true,
      message: 'Theme customization updated successfully'
    });
  } catch (error) {
    throw new CustomError(`Failed to update theme customization: ${error}`, 500);
  }
});

/**
 * Get theme installation details
 */
export const getThemeInstallationDetails = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const clientId = (req as any).user?.id;

  if (!installationId) {
    throw new CustomError('Installation ID is required', 400);
  }

  // Find installation record
  const installation = await InstalledThemes.findById(installationId)
    .populate('themeId', 'name description previewImage category')
    .populate('storeId', 'name subdomain');

  if (!installation) {
    throw new CustomError('Theme installation not found', 404);
  }

  // Verify client owns this installation
  if (installation.clientId.toString() !== clientId) {
    throw new CustomError('Unauthorized: You do not own this theme installation', 403);
  }

  try {
    // Get file system information
    const fileSystemThemes = await getInstalledThemes(
      clientId,
      installation.storeId.toString()
    );
    const fileSystemTheme = fileSystemThemes.find(
      t => t.themeId === installation.themeId.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        ...installation.toObject(),
        fileSystemInfo: fileSystemTheme || null
      }
    });
  } catch (error) {
    throw new CustomError(`Failed to get theme installation details: ${error}`, 500);
  }
});
