// @ts-nocheck
import { Request, Response } from 'express';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { cloneThemeToStore, getInstalledThemes, updateThemeCustomization, uninstallTheme, getThemeInstallationDetails } from '../utils/theme-clone.utils';
import { Theme } from '../models/theme.model';
import { Store } from '../models/store/store.model';
import { InstalledThemes } from '../models/installed-themes.model';
import mongoose from 'mongoose';

/**
 * Get all available themes for clients
 */
export const getAvailableThemes = asyncErrorHandler(async (req: Request, res: Response) => {
  const themes = await Theme.find({ status: 'active' })
    .select('name description category price previewImage installationCount')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: themes,
  });
});

/**
 * Install theme to client's store
 */
export const installClientTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId, storeId } = req.body;
  const clientId = (req as any).user?.id; // Assuming user ID is available in req.user

  if (!themeId || !storeId) {
    throw new CustomError('Theme ID and Store ID are required', 400);
  }
  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const themePath = await cloneThemeToStore(
    themeId,
    storeId,
    clientId
  );

  res.status(201).json({
    success: true,
    message: 'Theme installed successfully',
    data: { themePath },
  });
});

/**
 * Get all installed themes for a specific client's store
 */
export const getClientInstalledThemes = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const installedThemes = await getInstalledThemes(storeId, new mongoose.Types.ObjectId(storeId).toString());
  res.status(200).json({
    success: true,
    data: installedThemes,
  });
});

/**
 * Get details of a specific theme installation for client
 */
export const getClientThemeInstallation = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const installedTheme = await getThemeInstallationDetails(new mongoose.Types.ObjectId(installationId));
  
  // Verify that this installation belongs to the client
  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  res.status(200).json({
    success: true,
    data: installedTheme,
  });
});

/**
 * Update customizations for an installed theme (client)
 */
export const updateClientThemeCustomizations = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const { customizations } = req.body;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  if (!customizations || !Array.isArray(customizations)) {
    throw new CustomError('Customizations array is required', 400);
  }

  // Verify ownership before updating
  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  const updatedTheme = await updateThemeCustomization(
    installedTheme.storeId.toString(),
    installedTheme.themeId.toString(),
    customizations
  );

  res.status(200).json({
    success: true,
    message: 'Theme customizations updated successfully',
    data: updatedTheme,
  });
});

/**
 * Uninstall a theme from client's store
 */
export const uninstallClientTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  // Verify ownership before uninstalling
  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  await uninstallTheme(new mongoose.Types.ObjectId(installationId));
  res.status(200).json({
    success: true,
    message: 'Theme uninstalled successfully',
  });
});

/**
 * Get client's store information
 */
export const getClientStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const store = await Store.findOne({ userId: new mongoose.Types.ObjectId(clientId) });
  
  if (!store) {
    throw new CustomError('Store not found for this client', 404);
  }

  res.status(200).json({
    success: true,
    data: store,
  });
});
