import { Router } from "express";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddressesByCustomerId,
  updateCustomerAddress,
} from "../controllers/customer-address.controller";
import { protect } from "../middlewares/auth.middleware";

export const customerAddressRouter = Router();

// customerAddressRouter.use(protect);

// GET /api/customer-address/customer/:customerId - Get addresses for a customer
customerAddressRouter.get("/customer/:customerId", getCustomerAddressesByCustomerId);

// POST /api/customer-address - Create a new address
customerAddressRouter.post("/", createCustomerAddress);

// put /api/customer-address/:id - Update an address
customerAddressRouter.put("/:id", updateCustomerAddress);

// DELETE /api/customer-address/:id - Delete an address
customerAddressRouter.delete("/:id", deleteCustomerAddress);


