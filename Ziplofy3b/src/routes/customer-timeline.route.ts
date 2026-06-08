import { Router } from "express";
import { createCustomerTimeline, deleteCustomerTimeline, getCustomerTimelineEntriesByCustomerId, updateCustomerTimeline } from "../controllers/customer-timeline.controller";
import { protect } from "../middlewares/auth.middleware";

export const customerTimelineRouter = Router();

customerTimelineRouter.use(protect);

// POST /api/customer-timeline - Create a new customer timeline entry
customerTimelineRouter.post("/", createCustomerTimeline);

// PUT /api/customer-timeline/:id - Update a customer timeline entry
customerTimelineRouter.patch("/:id", updateCustomerTimeline);

// DELETE /api/customer-timeline/:id - Delete a customer timeline entry
customerTimelineRouter.delete("/:id", deleteCustomerTimeline);

// GET /api/customer-timeline/customer/:customerId - Get customer timeline entries by customer ID
customerTimelineRouter.get("/customer/:customerId", getCustomerTimelineEntriesByCustomerId);
