import { Router } from "express";
import {
  createStorePage,
  deleteStorePage,
  getStorePageById,
  getStorePagesByStoreId,
  updateStorePage,
} from "../controllers/store-page.controller";
import { protect } from "../middlewares/auth.middleware";

export const storePageRouter = Router();

storePageRouter.use(protect);

storePageRouter.get("/store/:storeId", getStorePagesByStoreId);
storePageRouter.get("/:id", getStorePageById);
storePageRouter.post("/", createStorePage);
storePageRouter.put("/:id", updateStorePage);
storePageRouter.patch("/:id", updateStorePage);
storePageRouter.delete("/:id", deleteStorePage);
