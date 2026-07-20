import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  getThemeFileStructure,
  getThemeFileContent,
  updateThemeFileContent,
  createThemeFile,
  deleteThemeFile,
} from '../controllers/client-theme-files.controller';

export const clientThemeFilesRouter = Router();

// All routes require authentication
clientThemeFilesRouter.use(protect);

// Get theme file structure
clientThemeFilesRouter.get('/installation/:installationId/structure', getThemeFileStructure);

// Get specific file content
clientThemeFilesRouter.get('/installation/:installationId/file/*', getThemeFileContent);

// Update file content
clientThemeFilesRouter.put('/installation/:installationId/file/*', updateThemeFileContent);

// Create new file
clientThemeFilesRouter.post('/installation/:installationId/file', createThemeFile);

// Delete file
clientThemeFilesRouter.delete('/installation/:installationId/file/*', deleteThemeFile);
