import { Router } from 'express';
import { createProductType, deleteProductType, getProductTypesByStoreId } from '../controllers/product-type.controller';
import { protect } from '../middlewares/auth.middleware';

export const productTypeRouter = Router();

// Apply authentication middleware to all routes
productTypeRouter.use(protect);

// Product type routes
productTypeRouter.post('/', createProductType);
productTypeRouter.get('/store/:storeId', getProductTypesByStoreId);
productTypeRouter.delete('/:id', deleteProductType);
