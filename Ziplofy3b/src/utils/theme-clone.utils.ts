// @ts-nocheck

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import mongoose from 'mongoose';
import { InstalledThemes } from '../models/installed-themes.model';
import { Theme } from '../models/theme.model';
import { downloadS3PrefixToLocalDir, downloadS3ZipAndExtractToDir } from './theme-zip-from-s3.util';
import { Store } from '../models/store/store.model';
import { CustomError } from './error.utils';

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * Recursively copy directory from source to destination
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  try {
    // Create destination directory if it doesn't exist
    await mkdir(dest, { recursive: true });

    // Read all items in source directory
    const items = await readdir(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      const itemStat = await stat(srcPath);

      if (itemStat.isDirectory()) {
        // Recursively copy subdirectory
        await copyDirectory(srcPath, destPath);
      } else {
        // Copy file
        await copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory from ${src} to ${dest}: ${error}`);
  }
}

/**
 * Clone theme to client's store directory
 * @param themeId - ID of the theme to clone
 * @param clientId - ID of the client
 * @param storeId - ID of the client's store
 * @returns Promise<string> - Path to the cloned theme directory
 */
export async function cloneThemeToStore(
  themeId: string,
  clientId: string,
  storeId: string
): Promise<string> {
  try {
    const theme = await Theme.findById(themeId).lean();
    if (!theme) {
      throw new Error(`Theme with ID ${themeId} not found`);
    }
    const zipKey = (theme as any).s3Assets?.zip?.key;
    const contentPrefix = (theme as any).s3Assets?.contentRoot?.prefix;
    if (!zipKey && !contentPrefix) {
      throw new Error(`Theme ${themeId} has no S3 package to clone`);
    }

    const clientStorePath = path.join(process.cwd(), 'uploads', 'stores', storeId);
    const destinationThemePath = path.join(clientStorePath, 'themes', themeId);

    await mkdir(path.join(clientStorePath, 'themes'), { recursive: true });

    if (fs.existsSync(destinationThemePath)) {
      await fs.promises.rm(destinationThemePath, { recursive: true, force: true });
    }
    await mkdir(destinationThemePath, { recursive: true });

    const unzippedRoot = path.join(destinationThemePath, 'unzippedTheme');
    if (zipKey) {
      await downloadS3ZipAndExtractToDir(zipKey, unzippedRoot);
    } else {
      await downloadS3PrefixToLocalDir(contentPrefix, unzippedRoot);
    }

    const customizationsPath = path.join(destinationThemePath, 'customizations');
    const clientCodePath = path.join(destinationThemePath, 'client-code');
    const assetsPath = path.join(destinationThemePath, 'assets');
    const stylesPath = path.join(destinationThemePath, 'styles');
    const scriptsPath = path.join(destinationThemePath, 'scripts');

    await mkdir(customizationsPath, { recursive: true });
    await mkdir(clientCodePath, { recursive: true });
    await mkdir(assetsPath, { recursive: true });
    await mkdir(stylesPath, { recursive: true });
    await mkdir(scriptsPath, { recursive: true });

    await copyDirectory(unzippedRoot, clientCodePath);

    const themeConfig = {
      themeId,
      clientId,
      storeId,
      installedAt: new Date().toISOString(),
      status: 'installed',
      version: '1.0.0',
      customizations: [],
      isActive: false,
      themePath: destinationThemePath,
      clientCodePath: clientCodePath,
      customizationsPath: customizationsPath,
      assetsPath: assetsPath,
      stylesPath: stylesPath,
      scriptsPath: scriptsPath
    };

    const configPath = path.join(destinationThemePath, 'theme-config.json');
    await fs.promises.writeFile(configPath, JSON.stringify(themeConfig, null, 2));

    const readmeContent = `# Theme Customization Guide

## Directory Structure
- \`client-code/\` - Original theme source files (for reference)
- \`customizations/\` - Your custom modifications
- \`assets/\` - Images, fonts, and other assets
- \`styles/\` - CSS files for styling
- \`scripts/\` - JavaScript files for functionality
`;

    const readmePath = path.join(destinationThemePath, 'README.md');
    await fs.promises.writeFile(readmePath, readmeContent);

    return destinationThemePath;
  } catch (error) {
    throw new Error(`Failed to clone theme: ${error}`);
  }
}

/**
 * Get list of installed themes for a client
 * @param clientId - ID of the client
 * @param storeId - ID of the client's store
 * @returns Promise<Array> - List of installed themes
 */
export async function getInstalledThemes(
  clientId: string,
  storeId: string
): Promise<any[]> {
  try {
    const clientStorePath = path.join(__dirname, '../../uploads/stores', storeId, 'themes');
    
    if (!fs.existsSync(clientStorePath)) {
      return [];
    }

    const themes = await readdir(clientStorePath);
    const installedThemes = [];

    for (const theme of themes) {
      const themePath = path.join(clientStorePath, theme);
      const configPath = path.join(themePath, 'theme-config.json');

      if (fs.existsSync(configPath)) {
        const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
        installedThemes.push({
          themeId: theme,
          ...config,
          themePath
        });
      }
    }

    return installedThemes;
  } catch (error) {
    throw new Error(`Failed to get installed themes: ${error}`);
  }
}

/**
 * Get details of a specific theme installation.
 * @param installationId The ID of the theme installation.
 * @returns The theme installation document.
 */
export const getThemeInstallationDetails = async (installationId: mongoose.Types.ObjectId) => {
  const installedTheme = await InstalledThemes.findById(installationId)
    .populate('themeId', 'name description previewImage')
    .lean();
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }
  return installedTheme;
};

/**
 * Uninstall a theme from a client's store.
 * This involves removing the cloned theme directory and updating the database status.
 * @param installationId The ID of the theme installation.
 * @returns A success message.
 */
export const uninstallTheme = async (installationId: mongoose.Types.ObjectId) => {
  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  // Remove the cloned theme directory
  if (installedTheme.themePath && fs.existsSync(installedTheme.themePath)) {
    await fs.promises.rm(installedTheme.themePath, { recursive: true, force: true });
  }

  // Update status in DB
  installedTheme.status = 'uninstalled';
  installedTheme.uninstalledAt = new Date();
  installedTheme.isActive = false; // Deactivate if uninstalled
  await installedTheme.save();

  return { message: 'Theme uninstalled successfully' };
};

/**
 * Update theme customization
 * @param storeId - ID of the client's store
 * @param themeId - ID of the theme
 * @param customization - Customization data
 */
export async function updateThemeCustomization(
  storeId: string,
  themeId: string,
  customization: any
): Promise<void> {
  try {
    const themePath = path.join(__dirname, '../../uploads/stores', storeId, 'themes', themeId);
    const configPath = path.join(themePath, 'theme-config.json');

    if (!fs.existsSync(configPath)) {
      throw new Error('Theme not found in client store');
    }

    const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
    config.customizations.push({
      ...customization,
      updatedAt: new Date().toISOString()
    });

    await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(`Failed to update theme customization: ${error}`);
  }
}
