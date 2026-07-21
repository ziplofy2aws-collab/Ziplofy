import express from 'express';
import { getAllTriggers } from '../controllers/trigger.controller';

const router = express.Router();

// GET /api/triggers
router.get('/', getAllTriggers);

export default router;


