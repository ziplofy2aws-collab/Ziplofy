import { Request, Response } from 'express';
import { PermissionDefinition } from '../models/permission/permission-definition.model';
import { asyncErrorHandler } from '../utils/error.utils';

// GET /api/permissions
export const getAllPermissions = asyncErrorHandler(async (_req: Request, res: Response) => {
  const permissions = await PermissionDefinition.find({})
    .sort({ resource: 1, parentKey: 1, order: 1, key: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: permissions,
    message: 'Permissions fetched successfully',
  });
});


