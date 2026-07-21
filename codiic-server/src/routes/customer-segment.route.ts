import { Router } from 'express';
import { createCustomerSegment, getCustomerSegmentsByStore, updateCustomerSegmentName, searchCustomerSegments } from '../controllers/customer-segment.controller';
import { protect } from '../middlewares/auth.middleware';

export const customerSegmentRouter = Router();

customerSegmentRouter.use(protect);

// POST /api/customer-segments
customerSegmentRouter.post('/', createCustomerSegment);

// GET /api/customer-segments/store/:storeId
customerSegmentRouter.get('/store/:storeId', getCustomerSegmentsByStore);

// SEARCH /api/customer-segments/search/:storeId
customerSegmentRouter.get('/search/:storeId', searchCustomerSegments);

// PATCH /api/customer-segments/:segmentId
customerSegmentRouter.patch('/:id', updateCustomerSegmentName);


