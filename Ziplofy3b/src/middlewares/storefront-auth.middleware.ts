import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Customer, ICustomer } from '../models';
import { CustomError } from '../utils/error.utils';

export interface StorefrontJwtPayload { _id: string; storeId: string; }

export const storefrontProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as StorefrontJwtPayload;
    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const customer = await Customer.findById(decoded._id).select('-password').lean() as any;
    if (!customer) return res.status(401).json({ success: false, message: 'Unauthorized' });

    req.storefrontUser = {
      ...customer,
      defaultAddress: customer.defaultAddress?.toString(),
    };
    next();
  } catch (err) {
    next(new CustomError('Unauthorized', 401));
  }
};
