import { Request, Response } from 'express';
import { Action } from '../models/action/action.model';
import { asyncErrorHandler } from '../utils/error.utils';

export const getAllActions = asyncErrorHandler(async (req: Request, res: Response) => {
  const actions = await Action.find({}).lean();

  return res.status(200).json({
    success: true,
    data: actions,
    message: 'Actions fetched successfully',
  });
});


