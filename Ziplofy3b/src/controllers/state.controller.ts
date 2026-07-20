import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { State } from '../models/state/state.model';
import { Country } from '../models/country/country.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// GET /states
export const getAllStates = asyncErrorHandler(async (req: Request, res: Response) => {
  const { countryId, countryIso2, q, limit = '500', page = '1' } = req.query as Record<string, string>;
  const numericLimit = Math.min(Math.max(parseInt(String(limit), 10) || 500, 1), 1000);
  const numericPage = Math.max(parseInt(String(page), 10) || 1, 1);

  const filter: Record<string, unknown> = {};
  
  if (countryId) {
    if (!mongoose.Types.ObjectId.isValid(countryId)) {
      throw new CustomError('Invalid country ID', 400);
    }
    filter.countryId = countryId;
  }
  
  if (countryIso2) {
    filter.countryIso2 = countryIso2.toUpperCase();
  }
  
  if (q && q.trim()) {
    const term = q.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { code: { $regex: term, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    State.find(filter)
      .populate('countryId', 'name iso2 iso3')
      .sort({ name: 1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .lean(),
    State.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: items,
    message: 'States fetched successfully',
    meta: { total, page: numericPage, limit: numericLimit },
  });
});

// GET /states/country/:countryId
export const getStatesByCountryId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { countryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError('Invalid country ID', 400);
  }

  // Verify country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError('Country not found', 404);
  }

  const states = await State.find({ countryId })
    .populate('countryId', 'name iso2 iso3')
    .sort({ name: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: states,
    message: 'States fetched successfully',
    meta: { 
      total: states.length,
      country: {
        id: country._id,
        name: country.name,
        iso2: country.iso2,
      },
    },
  });
});

// GET /states/:id
export const getStateById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError('Invalid state ID', 400);
  }

  const state = await State.findById(id).populate('countryId', 'name iso2 iso3').lean();

  if (!state) {
    throw new CustomError('State not found', 404);
  }

  const country = state.countryId && typeof state.countryId === 'object' && 'name' in state.countryId 
    ? (state.countryId as any)
    : null;

  return res.status(200).json({
    success: true,
    data: state,
    message: 'State fetched successfully',
    meta: {
      country: country ? {
        id: country._id,
        name: country.name,
        iso2: country.iso2,
      } : undefined,
    },
  });
});

