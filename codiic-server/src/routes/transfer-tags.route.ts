import { Router } from "express";
import { createTransferTag, deleteTransferTag, getTransferTagsByStore } from "../controllers/transfer-tags.controller";

export const transferTagsRouter = Router();

// Create a transfer tag
transferTagsRouter.post("/", createTransferTag);

// Get transfer tags by store id
transferTagsRouter.get("/store/:storeId", getTransferTagsByStore);

// Delete a transfer tag by id
transferTagsRouter.delete("/:id", deleteTransferTag);


