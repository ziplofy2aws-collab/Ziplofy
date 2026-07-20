import { Router } from 'express';
import { createMarketInclude, deleteMarketInclude, getMarketIncludesByMarketId } from '../controllers/market-includes.controller';

const marketIncludesRouter = Router();

marketIncludesRouter.post('/', createMarketInclude);
marketIncludesRouter.delete('/:id', deleteMarketInclude);
marketIncludesRouter.get('/market/:marketId', getMarketIncludesByMarketId);

export default marketIncludesRouter;


