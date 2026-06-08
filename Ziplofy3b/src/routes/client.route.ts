import { Router } from "express";
import { createClient, deleteClient, getClient, getClients, updateClient } from "../controllers/client.controller";
import { protect } from "../middlewares/auth.middleware";

export const clientRouter = Router();

// Protect all client routes
clientRouter.use(protect);

clientRouter.get("/", getClients);
clientRouter.post("/", createClient);
clientRouter.get("/:id", getClient);
clientRouter.put("/:id", updateClient);
clientRouter.delete("/:id", deleteClient);
