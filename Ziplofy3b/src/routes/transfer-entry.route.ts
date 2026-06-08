import { Router } from "express";
import { getTransferEntriesByTransferId } from "../controllers/transfer-entry.controller";
import { protect } from "../middlewares/auth.middleware";

export const transferEntryRouter = Router();

// Protect the route
transferEntryRouter.use(protect);


// Get entries for a transfer
transferEntryRouter.get("/transfer/:id", getTransferEntriesByTransferId);


