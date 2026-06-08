import { Request, Response } from 'express';
import { Trigger } from '../models/trigger/trigger.model';
import { asyncErrorHandler } from '../utils/error.utils';

export const getAllTriggers = asyncErrorHandler(async (req: Request, res: Response) => {
  const triggers = await Trigger.find({}).lean();

  return res.status(200).json({
    success: true,
    data: triggers,
    message: 'Triggers fetched successfully',
  });
});


