import express from 'express';
import { getAllActions } from '../controllers/action.controller';

const router = express.Router();

// GET /api/actions
router.get('/', getAllActions);

export default router;


