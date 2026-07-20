import { Router } from "express";
import { addCustomer, deleteCustomer, getCustomerById, getCustomersByStoreId, searchCustomers, updateCustomer } from "../controllers/customer.controller";
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
customerRouter.get("/:id", getCustomerById);

// PUT /api/customers/:id - Update a customer by ID
customerRouter.put("/:id", updateCustomer);

customerRouter.delete("/:id", deleteCustomer);