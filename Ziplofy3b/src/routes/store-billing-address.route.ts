import { Router } from "express";
import {
  createStoreBillingAddress,
  updateStoreBillingAddress,
  deleteStoreBillingAddress,
  getStoreBillingAddressesByStoreId,
} from "../controllers/store-billing-address.controller";

const router = Router();

// GET by storeId
router.get("/store/:storeId", getStoreBillingAddressesByStoreId);

// CREATE
router.post("/", createStoreBillingAddress);

// UPDATE by id
router.put("/:id", updateStoreBillingAddress);

// DELETE by id
router.delete("/:id", deleteStoreBillingAddress);

export default router;


