import { Router } from 'express';
import { getInventoryLevelsByLocation, updateInventoryLevel } from '../controllers/inventory-level.controller';
import { protect } from '../middlewares/auth.middleware';

export const inventoryLevelRouter = Router();

// All routes are protected
inventoryLevelRouter.use(protect);

// GET /api/inventory-levels/location/:locationId
inventoryLevelRouter.get('/location/:locationId', getInventoryLevelsByLocation);

// PUT /api/inventory-levels/:id
inventoryLevelRouter.put('/:id', updateInventoryLevel);


