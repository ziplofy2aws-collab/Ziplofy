"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSegmentEntryRouter = void 0;
const express_1 = require("express");
const customer_segment_entry_controller_1 = require("../controllers/customer-segment-entry.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.customerSegmentEntryRouter = (0, express_1.Router)();
exports.customerSegmentEntryRouter.use(auth_middleware_1.protect);
// POST /api/customer-segment-entries
exports.customerSegmentEntryRouter.post('/', customer_segment_entry_controller_1.createCustomerSegmentEntry);
// DELETE /api/customer-segment-entries/:id
exports.customerSegmentEntryRouter.delete('/:id', customer_segment_entry_controller_1.deleteCustomerSegmentEntry);
// GET /api/customer-segment-entries/segment/:segmentId
exports.customerSegmentEntryRouter.get('/segment/:segmentId', customer_segment_entry_controller_1.getCustomerSegmentEntriesBySegment);
