import { Router } from "express";
import {
  createStoreMenu,
  createStoreMenuItem,
  deleteStoreMenu,
  deleteStoreMenuItem,
  getStoreMenuById,
  getStoreMenuItemsByMenuId,
  getStoreMenusByStoreId,
  updateStoreMenu,
  updateStoreMenuItem,
} from "../controllers/store-menu.controller";
import { protect } from "../middlewares/auth.middleware";

export const storeMenuRouter = Router();

storeMenuRouter.use(protect);

storeMenuRouter.get("/store/:storeId", getStoreMenusByStoreId);
storeMenuRouter.get("/:menuId/items", getStoreMenuItemsByMenuId);
storeMenuRouter.get("/:id", getStoreMenuById);

storeMenuRouter.post("/", createStoreMenu);
storeMenuRouter.post("/:menuId/items", createStoreMenuItem);

storeMenuRouter.put("/:id", updateStoreMenu);
storeMenuRouter.patch("/:id", updateStoreMenu);

storeMenuRouter.put("/items/:id", updateStoreMenuItem);
storeMenuRouter.patch("/items/:id", updateStoreMenuItem);

storeMenuRouter.delete("/items/:id", deleteStoreMenuItem);
storeMenuRouter.delete("/:id", deleteStoreMenu);
