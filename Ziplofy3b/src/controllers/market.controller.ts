import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Market } from '../models/market/market.model';
import { Country } from '../models/country/country.model';
import { MarketIncludes } from '../models/market-includes/market-includes.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /markets
export const createMarket = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name, status } = req.body as { storeId: string; name: string; status?: 'active' | 'draft' };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (!name || typeof name !== 'string' || !name.trim()) throw new CustomError('name is required', 400);

  const created = await Market.create({ storeId, name: name.trim(), status: status || 'active',handle:name.trim()});
  return res.status(201).json({ success: true, data: created, message: 'Market created' });
});

// PUT /markets/:id
export const updateMarket = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, status } = req.body as { name?: string; status?: 'active' | 'draft' };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const update: any = {};
  if (typeof name === 'string') update.name = name.trim();
  if (status === 'active' || status === 'draft') update.status = status;

  const updated = await Market.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Market not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Market updated' });
});

// DELETE /markets/:id
export const deleteMarket = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const deleted = await Market.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Market not found', 404);
  return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Market deleted' });
});

// GET /markets/store/:storeId
export const getMarketsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const markets = await Market.find({ storeId }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: markets, message: 'Markets fetched' });
});

// GET /markets/store/:storeId/countries
export const getMarketCountriesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const markets = await Market.find({ storeId }).select({ _id: 1 }).lean();

  if (markets.length === 0) {
    return res.status(200).json({ success: true, data: [], message: 'No markets found for this store' });
  }

  const marketIds = markets.map((market) => market._id);

  const marketIncludes = await MarketIncludes.find({ marketId: { $in: marketIds } })
    .select({ countryId: 1 })
    .lean();

  const countryIdSet = new Set<string>();
  marketIncludes.forEach((include) => {
    const rawId = include.countryId as unknown;
    if (!rawId) return;
    const stringId =
      typeof rawId === 'string'
        ? rawId
        : (rawId as mongoose.Types.ObjectId).toString?.() ?? String(rawId);
    if (mongoose.isValidObjectId(stringId)) {
      countryIdSet.add(stringId);
    }
  });

  if (countryIdSet.size === 0) {
    return res.status(200).json({ success: true, data: [], message: 'No countries found for this store' });
  }

  const countries = await Country.find({ _id: { $in: Array.from(countryIdSet) } })
    .select({
      name: 1,
      officialName: 1,
      iso2: 1,
      iso3: 1,
      numericCode: 1,
      region: 1,
      subRegion: 1,
      flagEmoji: 1,
    })
    .lean();

  return res.status(200).json({
    success: true,
    data: countries,
    count: countries.length,
    message: 'Store countries fetched',
  });
});


