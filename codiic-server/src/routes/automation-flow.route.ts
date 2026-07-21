import express from 'express';
import { createAutomationFlow, getAutomationFlowsByStoreId, updateAutomationFlow } from '../controllers/automation-flow.controller';

const router = express.Router();

// GET /api/automation-flows/:storeId
router.get('/:storeId', getAutomationFlowsByStoreId);

// POST /api/automation-flows
router.post('/', createAutomationFlow);

// PUT /api/automation-flows/:automationFlowId
router.put('/:automationFlowId', updateAutomationFlow);

export default router;


