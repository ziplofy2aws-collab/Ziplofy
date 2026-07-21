import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MarketIncludes } from '../models/market-includes/market-includes.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /market-includes
export const createMarketInclude = asyncErrorHandler(async (req: Request, res: Response) => {
  const { marketId, countryId } = req.body as { marketId: string; countryId: string };

  if (!marketId || !mongoose.isValidObjectId(marketId)) throw new CustomError('Valid marketId is required', 400);
  if (!countryId || !mongoose.isValidObjectId(countryId)) throw new CustomError('Valid countryId is required', 400);

  const created = await MarketIncludes.create({ marketId, countryId });
  const populated = await MarketIncludes.findById(created._id).populate('countryId');
  return res.status(201).json({ success: true, data: populated, message: 'Market include created' });
});

// DELETE /market-includes/:id
export const deleteMarketInclude = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);
  const deleted = await MarketIncludes.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Market include not found', 404);
  return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Market include deleted' });
});

// GET /market-includes/market/:marketId
export const getMarketIncludesByMarketId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { marketId } = req.params as { marketId: string };
  if (!marketId || !mongoose.isValidObjectId(marketId)) throw new CustomError('Valid marketId is required', 400);
  const items = await MarketIncludes.find({ marketId }).populate('countryId').sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: items, message: 'Market includes fetched' });
});


