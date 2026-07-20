import { Router } from 'express';
import { createReturnRules, getReturnRulesByStoreId, updateReturnRules } from '../controllers/return-rules.controller';

const returnRulesRouter = Router();

// POST /api/return-rules
returnRulesRouter.post('/', createReturnRules);

// PUT /api/return-rules/:id
returnRulesRouter.put('/:id', updateReturnRules);

// GET /api/return-rules/store/:storeId
returnRulesRouter.get('/store/:storeId', getReturnRulesByStoreId);

export default returnRulesRouter;


