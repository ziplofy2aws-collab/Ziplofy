import { Request, Response } from "express";
import { asyncErrorHandler } from "../utils/error.utils";
import {
  loadStoreThemeConfig,
  saveStoreThemeConfig,
} from "../services/store-theme-config.service";

/** GET /store-theme-config/:storeId/:themeId */
export const getStoreThemeConfigByStore = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId, themeId } = req.params as { storeId: string; themeId: string };
    const data = await loadStoreThemeConfig(storeId, themeId);
    res.status(200).json({ success: true, data });
  }
);

/** PUT /store-theme-config/:storeId/:themeId — body: { values } | { overrides } | { config } */
export const putStoreThemeConfigByStore = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId, themeId } = req.params as { storeId: string; themeId: string };
    const { config, overrides, values } = req.body as {
      config?: Record<string, unknown>;
      overrides?: Record<string, unknown>;
      values?: Record<string, string | boolean>;
    };
    const data = await saveStoreThemeConfig(storeId, themeId, { config, overrides, values });
    res.status(200).json({
      success: true,
      message: "Theme configuration saved",
      data,
    });
  }
);
