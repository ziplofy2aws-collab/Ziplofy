import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { logExport, listExportLogs, downloadExport } from '../controllers/export-log.controller';

export const exportLogRouter = Router();

exportLogRouter.use(protect);

// Log an export (any authenticated user)
exportLogRouter.post('/', logExport);

// Download a specific export (super-admin only) - must be before /:id
exportLogRouter.get('/:id/download', downloadExport);

// List export logs (super-admin only)
exportLogRouter.get('/', listExportLogs);
