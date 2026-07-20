import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreCustomTheme } from '../models/store-custom-theme/store-custom-theme.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

function parseThemeConfig(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined) {
    throw new CustomError('themeConfig is required', 400);
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new CustomError('themeConfig must be a JSON object', 400);
  }
  return raw as Record<string, unknown>;
}

function parseOptionalThemeDesc(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'string') {
    throw new CustomError('themeDesc must be a string', 400);
  }
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : undefined;
}

export const createStoreCustomTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, themeConfig, themeName, themeDesc } = req.body as {
    storeId?: string;
    themeConfig?: unknown;
    themeName?: string;
    themeDesc?: string;
  };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const name = typeof themeName === 'string' ? themeName.trim() : '';
  if (!name) {
    throw new CustomError('themeName is required', 400);
  }

  const config = parseThemeConfig(themeConfig);
  const desc = parseOptionalThemeDesc(themeDesc);

  const created = await StoreCustomTheme.create({
    storeId,
    themeName: name,
    ...(desc !== undefined ? { themeDesc: desc } : {}),
    themeConfig: config,
  });

  res.status(201).json({
    success: true,
    message: 'Store custom theme created',
    data: created,
  });
});

export const getStoreCustomThemesByStoreId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId?: string };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    const items = await StoreCustomTheme.find({ storeId }).sort({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      message: 'Store custom themes retrieved',
      data: items,
      count: items.length,
    });
  }
);

export const updateStoreCustomTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  const { themeConfig, themeName, themeDesc } = req.body as {
    themeConfig?: unknown;
    themeName?: string;
    themeDesc?: string | null;
  };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid id is required', 400);
  }

  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};

  if (themeConfig !== undefined) {
    set.themeConfig = parseThemeConfig(themeConfig);
  }
  if (themeName !== undefined) {
    const name = String(themeName).trim();
    if (!name) throw new CustomError('themeName cannot be empty', 400);
    set.themeName = name;
  }
  if (themeDesc !== undefined) {
    if (themeDesc === null || (typeof themeDesc === 'string' && !themeDesc.trim())) {
      unset.themeDesc = 1;
    } else {
      const desc = parseOptionalThemeDesc(themeDesc);
      if (desc) set.themeDesc = desc;
      else unset.themeDesc = 1;
    }
  }

  if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
    throw new CustomError('Provide themeConfig, themeName, and/or themeDesc to update', 400);
  }

  const updated = await StoreCustomTheme.findByIdAndUpdate(
    id,
    {
      ...(Object.keys(set).length ? { $set: set } : {}),
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    throw new CustomError('Store custom theme not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Store custom theme updated',
    data: updated,
  });
});

export const deleteStoreCustomTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid id is required', 400);
  }

  const deleted = await StoreCustomTheme.findByIdAndDelete(id);

  if (!deleted) {
    throw new CustomError('Store custom theme not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Store custom theme deleted',
    data: { deletedId: id },
  });
});
