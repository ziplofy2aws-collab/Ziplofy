import { Router } from 'express';
import { createCustomerSegmentEntry, deleteCustomerSegmentEntry, getCustomerSegmentEntriesBySegment } from '../controllers/customer-segment-entry.controller';
import { protect } from '../middlewares/auth.middleware';

export const customerSegmentEntryRouter = Router();

customerSegmentEntryRouter.use(protect);

// POST /api/customer-segment-entries
customerSegmentEntryRouter.post('/', createCustomerSegmentEntry);

// DELETE /api/customer-segment-entries/:id
customerSegmentEntryRouter.delete('/:id', deleteCustomerSegmentEntry);

// GET /api/customer-segment-entries/segment/:segmentId
customerSegmentEntryRouter.get('/segment/:segmentId', getCustomerSegmentEntriesBySegment);


