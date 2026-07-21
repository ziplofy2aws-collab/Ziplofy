import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreRole } from '../models/store-role/store-role.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// GET /api/store-roles?storeId=...
export const getRolesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.query as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  const roles = await StoreRole.find({ storeId }).sort({ isDefault: -1, name: 1 }).lean();
  return res.status(200).json({ success: true, data: roles, message: 'Roles fetched successfully' });
});

// POST /api/store-roles
export const createRole = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name, description, permissions, isDefault } = req.body || {};
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (!name) {
    throw new CustomError('Role name is required', 400);
  }
  const role = await StoreRole.create({
    storeId,
    name: String(name).trim(),
    description: description ? String(description).trim() : undefined,
    permissions: Array.isArray(permissions) ? permissions : [],
    isDefault: Boolean(isDefault),
  });
  return res.status(201).json({ success: true, data: role, message: 'Role created successfully' });
});

// PATCH /api/store-roles/:roleId
export const updateRole = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params as { roleId: string };
  if (!mongoose.isValidObjectId(roleId)) {
    throw new CustomError('Invalid roleId', 400);
  }
  const payload: Partial<{
    name: string;
    description: string;
    permissions: string[];
    isDefault: boolean;
  }> = {};
  if (req.body.name !== undefined) payload.name = String(req.body.name).trim();
  if (req.body.description !== undefined) payload.description = String(req.body.description).trim();
  if (req.body.permissions !== undefined)
    payload.permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
  if (req.body.isDefault !== undefined) payload.isDefault = Boolean(req.body.isDefault);

  const updated = await StoreRole.findByIdAndUpdate(roleId, { $set: payload }, { new: true });
  if (!updated) throw new CustomError('Role not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Role updated successfully' });
});

// DELETE /api/store-roles/:roleId
export const deleteRole = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params as { roleId: string };
  if (!mongoose.isValidObjectId(roleId)) {
    throw new CustomError('Invalid roleId', 400);
  }
  const deleted = await StoreRole.findByIdAndDelete(roleId);
  if (!deleted) throw new CustomError('Role not found', 404);
  return res.status(200).json({ success: true, data: deleted, message: 'Role deleted successfully' });
});


