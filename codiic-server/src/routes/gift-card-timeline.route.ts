import express from 'express';
import {
    createTimelineEntry,
    deleteTimelineEntry,
    getTimelineByGiftCardId,
    updateTimelineEntry,
} from '../controllers/gift-card-timeline.controller';
import { protect } from '../middlewares/auth.middleware';

export const giftCardTimelineRouter = express.Router();

// Apply authentication middleware to all routes
giftCardTimelineRouter.use(protect);

// Create timeline entry
giftCardTimelineRouter.post('/', createTimelineEntry);

// Get timeline entries by gift card id
giftCardTimelineRouter.get('/gift-card/:giftCardId', getTimelineByGiftCardId);

// Update timeline entry
giftCardTimelineRouter.put('/:id', updateTimelineEntry);

// Delete timeline entry
giftCardTimelineRouter.delete('/:id', deleteTimelineEntry);
