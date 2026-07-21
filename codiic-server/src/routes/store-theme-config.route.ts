import { Router } from "express";
import {
  getStoreThemeConfigByStore,
  putStoreThemeConfigByStore,
} from "../controllers/store-theme-config.controller";
import { protect } from "../middlewares/auth.middleware";

export const storeThemeConfigRouter = Router();

storeThemeConfigRouter.use(protect);

storeThemeConfigRouter.get("/:storeId/:themeId", getStoreThemeConfigByStore);
storeThemeConfigRouter.put("/:storeId/:themeId", putStoreThemeConfigByStore);
