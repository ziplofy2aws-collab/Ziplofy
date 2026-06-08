import { Router } from 'express';
import { createTransferTimeline, deleteTransferTimeline, getTransferTimelineByTransferId, updateTransferTimeline } from '../controllers/transfer-timeline.controller';
import { protect } from '../middlewares/auth.middleware';

export const transferTimelineRouter = Router();

transferTimelineRouter.use(protect);

// Create timeline entry
transferTimelineRouter.post('/', createTransferTimeline);

// Get by transfer id
transferTimelineRouter.get('/transfer/:transferId', getTransferTimelineByTransferId);

// Update timeline entry
transferTimelineRouter.put('/:id', updateTransferTimeline);

// Delete timeline entry
transferTimelineRouter.delete('/:id', deleteTransferTimeline);


