import { Router } from 'express';
import { createPixel, deletePixel, getPixelsByStoreId, updatePixel } from '../controllers/pixel.controller';

const router = Router();

router.get('/store/:storeId', getPixelsByStoreId);
router.post('/', createPixel);
router.put('/:id', updatePixel);
router.delete('/:id', deletePixel);

export default router;


