import { Request, Response } from 'express';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { buildRobotsTxt } from '../utils/robots-txt.util';
import { resolveStoreFromRequest } from '../utils/storefront-host.util';

export const getStorefrontRobots = asyncErrorHandler(async (req: Request, res: Response) => {
  const resolved = await resolveStoreFromRequest(req);
  if (!resolved) {
    throw new CustomError('Store not found for this hostname', 404);
  }

  const text = buildRobotsTxt(resolved.publicOrigin);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(text);
});
