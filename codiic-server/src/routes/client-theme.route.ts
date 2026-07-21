import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  getAvailableThemes,
  installClientTheme,
  getClientInstalledThemes,
  getClientThemeInstallation,
  updateClientThemeCustomizations,
  uninstallClientTheme,
  getClientStore,
} from '../controllers/client-theme.controller';

export const clientThemeRouter = Router();

// All routes require authentication
clientThemeRouter.use(protect);

// Get all available themes
clientThemeRouter.get('/themes', getAvailableThemes);

// Get client's store information
clientThemeRouter.get('/store', getClientStore);

// Install a theme to client's store
clientThemeRouter.post('/install', installClientTheme);

// Get all installed themes for a specific store
clientThemeRouter.get('/store/:storeId/themes', getClientInstalledThemes);

// Get details of a specific theme installation
clientThemeRouter.get('/installation/:installationId', getClientThemeInstallation);

// Update customizations for an installed theme
clientThemeRouter.put('/installation/:installationId/customize', updateClientThemeCustomizations);

// Uninstall a theme from client's store
clientThemeRouter.delete('/installation/:installationId', uninstallClientTheme);
