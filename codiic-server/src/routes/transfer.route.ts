import { Router } from "express";
import { createTransfer, deleteTransfer, getTransfersByStoreId, updateTransfer, markTransferReadyToShip } from "../controllers/transfer.controller";
import { protect } from "../middlewares/auth.middleware";

export const transferRouter = Router();

transferRouter.use(protect);

// Create a transfer
transferRouter.post("/", createTransfer);

// Get transfers by store id
transferRouter.get("/store/:storeId", getTransfersByStoreId);

// Update a transfer
transferRouter.put("/:id", updateTransfer);

// Delete a transfer
transferRouter.delete("/:id", deleteTransfer);

// Mark transfer as ready to ship
transferRouter.post("/:id/ready-to-ship", markTransferReadyToShip);


