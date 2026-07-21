import { Router } from 'express';
import { AmountOffProductsDiscountController } from '../controllers/amount-off-products-discount.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', AmountOffProductsDiscountController.createDiscount);
router.get('/store/:id', AmountOffProductsDiscountController.getDiscountsByStore);
// Get orders where this discount was used (must be before /:id)
router.get('/:id/orders', AmountOffProductsDiscountController.getOrdersByDiscount);
router.get('/:id', AmountOffProductsDiscountController.getDiscountById);
router.put('/:id', AmountOffProductsDiscountController.updateDiscount);
router.delete('/:id', AmountOffProductsDiscountController.deleteDiscount);

export default router;
