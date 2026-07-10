import { Router } from "express";
import { addCustomer, deleteCustomer, getCustomersByStoreId, searchCustomers } from "../controllers/customer.controller";
import { protect } from "../middlewares/auth.middleware";

export const customerRouter = Router();
customerRouter.use(protect);

// GET /api/customers/store/:storeId - Get customers by store ID
customerRouter.get("/store/:storeId", getCustomersByStoreId);

// SEARCH /api/customers/search/:storeId - Search customers with fuzzy search
customerRouter.get("/search/:storeId", searchCustomers);

// POST /api/customers - Add a new customer
customerRouter.post("/", addCustomer);

// DELETE /api/customers/:id - Delete a customer by ID
customerRouter.delete("/:id", deleteCustomer);