import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreSecuritySettings } from '../models/store-security-settings/store-security-settings.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Helper function to generate a random 8-character alphanumeric security code
const generateSecurityCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// GET /api/store-security-settings/:storeId
export const getSecuritySettingsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  
  let settings = await StoreSecuritySettings.findOne({ storeId }).lean();
  
  // If settings don't exist, create them with default values
  if (!settings) {
    const newSettings = await StoreSecuritySettings.create({
      storeId,
      requireCode: false,
      securityCode: null,
      codeGeneratedAt: null,
    });
    settings = newSettings.toObject() as any;
    return res.status(200).json({ success: true, data: settings, message: 'Security settings created and fetched successfully' });
  }
  
  return res.status(200).json({ success: true, data: settings, message: 'Security settings fetched successfully' });
});

// PATCH /api/store-security-settings/:id
export const updateSecuritySettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid id', 400);
  }
  
  const { requireCode } = req.body;
  
  if (requireCode === undefined) {
    throw new CustomError('requireCode is required', 400);
  }
  
  const existing = await StoreSecuritySettings.findById(id);
  if (!existing) throw new CustomError('Security settings not found', 404);
  
  const payload: Partial<{
    requireCode: boolean;
    securityCode: string | null;
    codeGeneratedAt: Date | null;
  }> = {
    requireCode: Boolean(requireCode),
  };
  
  // Generate code if requireCode is true and no code exists
  if (Boolean(requireCode) && !existing.securityCode) {
    payload.securityCode = generateSecurityCode();
    payload.codeGeneratedAt = new Date();
  } else if (!Boolean(requireCode)) {
    // If requireCode is false, clear the code
    payload.securityCode = null;
    payload.codeGeneratedAt = null;
  }

  const updated = await StoreSecuritySettings.findByIdAndUpdate(id, { $set: payload }, { new: true });
  if (!updated) throw new CustomError('Security settings not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Security settings updated successfully' });
});

// GET /api/store-security-settings/:id/generateNewCode
export const generateNewSecurityCode = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid id', 400);
  }
  
  const newCode = generateSecurityCode();
  const updated = await StoreSecuritySettings.findByIdAndUpdate(
    id,
    {
      $set: {
        securityCode: newCode,
        codeGeneratedAt: new Date(),
      },
    },
    { new: true }
  );
  
  if (!updated) throw new CustomError('Security settings not found', 404);
  return res.status(200).json({
    success: true,
    data: updated,
    message: 'New security code generated successfully',
  });
});

