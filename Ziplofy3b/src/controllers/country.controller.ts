import { Request, Response } from 'express';
import { Country } from '../models/country/country.model';
import { asyncErrorHandler } from '../utils/error.utils';

// GET /countries
export const getAllCountries = asyncErrorHandler(async (req: Request, res: Response) => {
  const { q, limit = '500', page = '1' } = req.query as Record<string, string>;
  const numericLimit = Math.min(Math.max(parseInt(String(limit), 10) || 500, 1), 1000);
  const numericPage = Math.max(parseInt(String(page), 10) || 1, 1);

  const filter: Record<string, unknown> = {};
  if (q && q.trim()) {
    const term = q.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { officialName: { $regex: term, $options: 'i' } },
      { iso2: { $regex: term, $options: 'i' } },
      { iso3: { $regex: term, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Country.find(filter)
      .sort({ name: 1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .lean(),
    Country.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: items,
    message: 'Countries fetched successfully',
    meta: { total, page: numericPage, limit: numericLimit },
  });
});


