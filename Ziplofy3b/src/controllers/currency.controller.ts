import { Request, Response } from 'express';
import { Currency } from '../models/currency/currency.model';

export async function getCurrencies(req: Request, res: Response) {
  try {
    const { q, active, limit = '50', page = '1' } = req.query as Record<string, string>;
    const numericLimit = Math.min(Math.max(parseInt(String(limit), 10) || 50, 1), 500);
    const numericPage = Math.max(parseInt(String(page), 10) || 1, 1);

    const filter: Record<string, unknown> = {};
    if (typeof q === 'string' && q.trim()) {
      filter.$or = [
        { code: { $regex: q.trim(), $options: 'i' } },
        { name: { $regex: q.trim(), $options: 'i' } },
        { symbol: { $regex: q.trim(), $options: 'i' } },
      ];
    }
    if (active === 'true' || active === 'false') {
      filter.isActive = active === 'true';
    }

    const [items, total] = await Promise.all([
      Currency.find(filter)
        .sort({ code: 1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .lean(),
      Currency.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      message: 'Currencies fetched successfully',
      meta: { total, page: numericPage, limit: numericLimit },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, data: [], message: error?.message || 'Failed to fetch currencies' });
  }
}


