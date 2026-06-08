import { Router } from 'express';
import { createFinalSaleItem, deleteFinalSaleItem, getFinalSaleItemsByReturnRulesId } from '../controllers/final-sale-item.controller';

const finalSaleItemRouter = Router();

// Create
finalSaleItemRouter.post('/', createFinalSaleItem);

// Delete by id
finalSaleItemRouter.delete('/:id', deleteFinalSaleItem);

// Get by returnRulesId
finalSaleItemRouter.get('/return-rules/:returnRulesId', getFinalSaleItemsByReturnRulesId);

export default finalSaleItemRouter;


