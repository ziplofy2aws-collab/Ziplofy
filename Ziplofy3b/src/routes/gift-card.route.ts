import { Router } from 'express';
import {
    createGiftCard,
    deleteGiftCard,
    getGiftCardsByStoreId,
    updateGiftCard
} from '../controllers/gift-card.controller';
import { protect } from '../middlewares/auth.middleware';

export const giftCardRouter = Router();

// Apply authentication middleware to all routes
giftCardRouter.use(protect);

// Gift card routes
giftCardRouter.post('/', createGiftCard);
giftCardRouter.get('/store/:storeId', getGiftCardsByStoreId);
giftCardRouter.put('/:id', updateGiftCard);
giftCardRouter.delete('/:id', deleteGiftCard);
