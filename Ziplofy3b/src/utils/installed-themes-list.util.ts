import { Request } from 'express';
import { Types } from 'mongoose';
import { InstalledThemes } from '../models/installed-themes.model';

export type InstalledThemeListItem = {
  _id: unknown;
  name: string;
  description?: string;
  category?: string;
  thumbnailUrl: string | null;
  installedThemeId: unknown;
  installedAt?: Date | null;
  uninstalledAt?: Date | null;
  isCustomTheme: false;
};

/** InstalledThemes for a store, with Theme documents joined. */
export async function listInstalledThemesForStore(storeId: string): Promise<InstalledThemeListItem[]> {
  const rows = await InstalledThemes.find({
    store: new Types.ObjectId(storeId),
    uninstalledAt: null,
  })
    .populate('theme')
    .sort({ installedAt: -1 })
    .lean();

  return rows
    .filter((row) => row.theme && typeof row.theme === 'object' && 'name' in (row.theme as object))
    .map((row) => {
      const theme = row.theme as unknown as {
        _id: unknown;
        name: string;
        description?: string;
        category?: string;
        s3Assets?: { thumbnail?: { url?: string } };
      };
      return {
        _id: theme._id,
        name: theme.name,
        description: theme.description,
        category: theme.category,
        thumbnailUrl: theme.s3Assets?.thumbnail?.url ?? null,
        installedThemeId: row._id,
        installedAt: row.installedAt,
        uninstalledAt: row.uninstalledAt,
        isCustomTheme: false as const,
      };
    });
}

export function resolveInstalledThemesStoreId(req: Request): string | null {
  const q = req.query as { storeId?: string; userId?: string };
  return q.storeId || q.userId || (req.params as { userId?: string }).userId || req.user?.id || null;
}
