import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  createGiftCardProduct,
  deleteGiftCardProduct,
  getGiftCardProductById,
  getGiftCardProductsByStoreId,
  updateGiftCardProduct,
} from '../controllers/gift-card-product.controller';

export const giftCardProductRouter = Router();

giftCardProductRouter.use(protect);

giftCardProductRouter.post('/', createGiftCardProduct);
giftCardProductRouter.get('/store/:storeId', getGiftCardProductsByStoreId);
giftCardProductRouter.get('/:id', getGiftCardProductById);
giftCardProductRouter.put('/:id', updateGiftCardProduct);
giftCardProductRouter.delete('/:id', deleteGiftCardProduct);
