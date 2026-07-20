import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CatalogMarket } from '../models/catalog-market/catalog-market.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /catalog-markets
export const createCatalogMarket = asyncErrorHandler(async (req: Request, res: Response) => {
  const { catalogId, marketId } = req.body as { catalogId: string; marketId: string };

  if (!catalogId || !mongoose.isValidObjectId(catalogId)) throw new CustomError('Valid catalogId is required', 400);
  if (!marketId || !mongoose.isValidObjectId(marketId)) throw new CustomError('Valid marketId is required', 400);

  const created = await CatalogMarket.create({ catalogId, marketId });
  return res.status(201).json({ success: true, data: created, message: 'Catalog market created' });
});

// DELETE /catalog-markets/:id
export const deleteCatalogMarket = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);
  const deleted = await CatalogMarket.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Catalog market not found', 404);
  return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Catalog market deleted' });
});

// GET /catalog-markets/catalog/:catalogId
export const getCatalogMarketsByCatalogId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { catalogId } = req.params as { catalogId: string };
  if (!catalogId || !mongoose.isValidObjectId(catalogId)) throw new CustomError('Valid catalogId is required', 400);
  const items = await CatalogMarket.find({ catalogId }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: items, message: 'Catalog markets fetched' });
});


