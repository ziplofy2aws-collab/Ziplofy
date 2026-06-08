"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerTimelineRouter = void 0;
const express_1 = require("express");
const customer_timeline_controller_1 = require("../controllers/customer-timeline.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.customerTimelineRouter = (0, express_1.Router)();
exports.customerTimelineRouter.use(auth_middleware_1.protect);
// POST /api/customer-timeline - Create a new customer timeline entry
exports.customerTimelineRouter.post("/", customer_timeline_controller_1.createCustomerTimeline);
// PUT /api/customer-timeline/:id - Update a customer timeline entry
exports.customerTimelineRouter.patch("/:id", customer_timeline_controller_1.updateCustomerTimeline);
// DELETE /api/customer-timeline/:id - Delete a customer timeline entry
exports.customerTimelineRouter.delete("/:id", customer_timeline_controller_1.deleteCustomerTimeline);
// GET /api/customer-timeline/customer/:customerId - Get customer timeline entries by customer ID
exports.customerTimelineRouter.get("/customer/:customerId", customer_timeline_controller_1.getCustomerTimelineEntriesByCustomerId);
