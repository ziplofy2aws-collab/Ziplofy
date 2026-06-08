// @ts-nocheck
import { Request, Response } from 'express';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import fs from 'fs';
import path from 'path';
import { InstalledThemes } from '../models/installed-themes.model';
import mongoose from 'mongoose';

/**
 * Get theme file structure for client
 */
export const getThemeFileStructure = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  const themePath = installedTheme.themePath;
  if (!fs.existsSync(themePath)) {
    throw new CustomError('Theme directory not found', 404);
  }

  const fileStructure = await getDirectoryStructure(themePath);
  
  res.status(200).json({
    success: true,
    data: {
      installationId,
      themePath,
      fileStructure,
      directories: {
        clientCode: path.join(themePath, 'client-code'),
        customizations: path.join(themePath, 'customizations'),
        assets: path.join(themePath, 'assets'),
        styles: path.join(themePath, 'styles'),
        scripts: path.join(themePath, 'scripts')
      }
    }
  });
});

/**
 * Get specific theme file content
 */
export const getThemeFileContent = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId, filePath } = req.params;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  const fullPath = path.join(installedTheme.themePath, filePath);
  
  // Security check - ensure file is within theme directory
  if (!fullPath.startsWith(installedTheme.themePath)) {
    throw new CustomError('Access denied. Invalid file path.', 403);
  }

  if (!fs.existsSync(fullPath)) {
    throw new CustomError('File not found', 404);
  }

  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    throw new CustomError('Path is a directory, not a file', 400);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const fileExtension = path.extname(fullPath);
  
  res.status(200).json({
    success: true,
    data: {
      filePath,
      content,
      fileExtension,
      size: stats.size,
      lastModified: stats.mtime
    }
  });
});

/**
 * Update theme file content
 */
export const updateThemeFileContent = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId, filePath } = req.params;
  const { content } = req.body;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  if (!content) {
    throw new CustomError('File content is required', 400);
  }

  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  const fullPath = path.join(installedTheme.themePath, filePath);
  
  // Security check - ensure file is within theme directory
  if (!fullPath.startsWith(installedTheme.themePath)) {
    throw new CustomError('Access denied. Invalid file path.', 403);
  }

  // Create directory if it doesn't exist
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file content
  fs.writeFileSync(fullPath, content, 'utf8');

  // Update theme installation record
  installedTheme.updatedAt = new Date();
  await installedTheme.save();

  res.status(200).json({
    success: true,
    message: 'File updated successfully',
    data: {
      filePath,
      lastModified: new Date()
    }
  });
});

/**
 * Create new theme file
 */
export const createThemeFile = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId } = req.params;
  const { filePath, content } = req.body;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  if (!filePath || !content) {
    throw new CustomError('File path and content are required', 400);
  }

  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  const fullPath = path.join(installedTheme.themePath, filePath);
  
  // Security check - ensure file is within theme directory
  if (!fullPath.startsWith(installedTheme.themePath)) {
    throw new CustomError('Access denied. Invalid file path.', 403);
  }

  // Check if file already exists
  if (fs.existsSync(fullPath)) {
    throw new CustomError('File already exists', 409);
  }

  // Create directory if it doesn't exist
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file content
  fs.writeFileSync(fullPath, content, 'utf8');

  res.status(201).json({
    success: true,
    message: 'File created successfully',
    data: {
      filePath,
      created: new Date()
    }
  });
});

/**
 * Delete theme file
 */
export const deleteThemeFile = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installationId, filePath } = req.params;
  const clientId = (req as any).user?.id;

  if (!clientId) {
    throw new CustomError('Client ID not found in request', 401);
  }

  const installedTheme = await InstalledThemes.findById(installationId);
  if (!installedTheme) {
    throw new CustomError('Theme installation not found', 404);
  }

  if (installedTheme.clientId.toString() !== clientId) {
    throw new CustomError('Access denied. This theme installation does not belong to you.', 403);
  }

  const fullPath = path.join(installedTheme.themePath, filePath);
  
  // Security check - ensure file is within theme directory
  if (!fullPath.startsWith(installedTheme.themePath)) {
    throw new CustomError('Access denied. Invalid file path.', 403);
  }

  if (!fs.existsSync(fullPath)) {
    throw new CustomError('File not found', 404);
  }

  // Don't allow deletion of critical files
  const criticalFiles = ['theme-config.json', 'README.md'];
  if (criticalFiles.includes(path.basename(fullPath))) {
    throw new CustomError('Cannot delete critical theme files', 403);
  }

  fs.unlinkSync(fullPath);

  res.status(200).json({
    success: true,
    message: 'File deleted successfully'
  });
});

/**
 * Helper function to get directory structure
 */
async function getDirectoryStructure(dirPath: string, basePath: string = ''): Promise<any[]> {
  const items = fs.readdirSync(dirPath);
  const structure: any[] = [];

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const children = await getDirectoryStructure(fullPath, relativePath);
      structure.push({
        name: item,
        type: 'directory',
        path: relativePath,
        children
      });
    } else {
      structure.push({
        name: item,
        type: 'file',
        path: relativePath,
        size: stats.size,
        lastModified: stats.mtime
      });
    }
  }

  return structure;
}
