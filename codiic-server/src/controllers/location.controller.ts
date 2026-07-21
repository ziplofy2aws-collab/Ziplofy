import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ILocation, LocationModel } from '../models/location/location.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Create location
export const createLocation = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,
    name,
    countryRegion,
    address,
    apartment,
    city,
    state,
    postalCode,
    phone,
    canShip,
    canLocalDeliver,
    canPickup,
    isFulfillmentAllowed,
  } = req.body as Partial<ILocation>

  if (!storeId || !name || !countryRegion || !address || !city || !state || !postalCode || !phone) {
    throw new CustomError('Missing required fields', 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const location = await LocationModel.create({
    storeId,
    name,
    countryRegion,
    address,
    apartment,
    city,
    state,
    postalCode,
    phone,
    canShip,
    canLocalDeliver,
    canPickup,
    isFulfillmentAllowed,
  });

  res.status(201).json({ success: true, data: location, message: 'Location created successfully' });
});

// Get locations by store id
export const getLocationsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId) {
    throw new CustomError('storeId is required', 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const locations = await LocationModel.find({ storeId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: locations, count: locations.length });
});

// Update location
export const updateLocation = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const update = req.body as Partial<ILocation>;
    
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid location id', 400);
  }

  // If storeId provided in update, validate
  if (update.storeId && !mongoose.isValidObjectId(update.storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const location = await LocationModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!location) {
    throw new CustomError('Location not found', 404);
  }

  res.status(200).json({ success: true, data: location, message: 'Location updated successfully' });
});

// Delete location
export const deleteLocation = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid location id', 400);
  }

  const deleted = await LocationModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new CustomError('Location not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { deletedLocation: { id: deleted._id, name: deleted.name } },
    message: 'Location deleted successfully',
  });
});
