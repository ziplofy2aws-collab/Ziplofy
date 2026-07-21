import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  createLocation,
  getLocationsByStoreId,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller';

export const locationRouter = express.Router();

// protect all routes
locationRouter.use(protect);

// Create
locationRouter.post('/', createLocation);

// Get by store id
locationRouter.get('/store/:storeId', getLocationsByStoreId);

// Update
locationRouter.put('/:id', updateLocation);

// Delete
locationRouter.delete('/:id', deleteLocation);


