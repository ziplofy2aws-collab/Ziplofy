import { Router } from "express";
import { addVendor, deleteVendor, getVendorsByStoreId } from "../controllers/vendor.controller";
import { protect } from "../middlewares/auth.middleware";

export const vendorRouter = Router();

vendorRouter.use(protect);

// POST /api/vendors - Add a new vendor
vendorRouter.post("/", addVendor);

// DELETE /api/vendors/:id - Delete a vendor by ID
vendorRouter.delete("/:id", deleteVendor);

// GET /api/vendors/store/:storeId - Get vendors by store
vendorRouter.get("/store/:storeId", getVendorsByStoreId);
