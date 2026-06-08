import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Store } from "../models/store/store.model";

type NetworkThemePack = {
  id: "theme1" | "theme2";
  name: string;
  version: string;
  description: string;
  homeEntry: "theme1" | "theme2";
  productEntry: "theme1" | "theme2";
  profileEntry: "theme1" | "theme2";
  ordersEntry: "theme1" | "theme2";
  preferencesEntry: "theme1" | "theme2";
};

function readPackFile(packId: "theme1" | "theme2"): NetworkThemePack {
  const filePath = path.join(process.cwd(), "src", "data", "storefront-theme-packs", `${packId}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as NetworkThemePack;
}

/**
 * Network payload for React theme packs.
 * These files are what "travel over the network" to storefront clients.
 */
export const getStorefrontReactThemePack = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!storeId) throw new CustomError("Store ID is required", 400);

  const store = await Store.findById(storeId).select("_id").lean();
  if (!store) throw new CustomError("Store not found", 404);

  const theme1 = readPackFile("theme1");
  const theme2 = readPackFile("theme2");
  const packs = [theme1, theme2];

  // For now we keep active pack deterministic; can later be mapped from installed theme per store.
  const activePackId: "theme1" | "theme2" = "theme1";

  res.status(200).json({
    success: true,
    data: {
      storeId,
      activePackId,
      packs,
    },
  });
});

/**
 * Simple production-like endpoint requested by frontend:
 * GET /api/get-store-theme
 * Returns theme1 pack payload over network.
 */
export const getStoreTheme = asyncErrorHandler(async (_req: Request, res: Response) => {
  const theme1 = readPackFile("theme1");
  res.status(200).json({
    success: true,
    data: {
      activePackId: "theme1",
      theme: theme1,
      packs: [theme1],
    },
  });
});

