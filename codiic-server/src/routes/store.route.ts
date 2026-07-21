import { Router } from "express";
import {
  createStore,
  getStoresByUserId,
  getStoresByUserParam,
  updateStore
} from "../controllers/store.controller";
import { protect } from "../middlewares/auth.middleware";

export const storeRouter = Router();

// Protected routes (authentication required)
storeRouter.use(protect);

// Get stores for authenticated user
storeRouter.get("/my-stores", getStoresByUserId);

// Get stores for a specific user (super-admin/support-admin only)
storeRouter.get("/user/:userId", getStoresByUserParam);

// Create a new store
storeRouter.post("/", createStore);

// Update a store
storeRouter.put('/:id', updateStore);
