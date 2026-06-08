"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSegmentRouter = void 0;
const express_1 = require("express");
const customer_segment_controller_1 = require("../controllers/customer-segment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.customerSegmentRouter = (0, express_1.Router)();
exports.customerSegmentRouter.use(auth_middleware_1.protect);
// POST /api/customer-segments
exports.customerSegmentRouter.post('/', customer_segment_controller_1.createCustomerSegment);
// GET /api/customer-segments/store/:storeId
exports.customerSegmentRouter.get('/store/:storeId', customer_segment_controller_1.getCustomerSegmentsByStore);
// SEARCH /api/customer-segments/search/:storeId
exports.customerSegmentRouter.get('/search/:storeId', customer_segment_controller_1.searchCustomerSegments);
// PATCH /api/customer-segments/:segmentId
exports.customerSegmentRouter.patch('/:id', customer_segment_controller_1.updateCustomerSegmentName);
