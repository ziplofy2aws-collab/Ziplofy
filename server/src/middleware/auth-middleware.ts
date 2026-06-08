import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SecureUserInfo } from '../controllers/auth.controller';
import { IUser, User } from '../models/user';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

interface JWTPayload {
  uid: string;
  email?: string;
  iat?: number;
  exp?: number;
}


export const protect = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  
  let token: string | undefined = undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new CustomError('Authorization required', 401));

  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JWTPayload;
  if (!payload.uid) return next(new CustomError('Invalid payload', 401));
  
  // Fetch the full user object from database
  const user = await User.findById(payload.uid);
  if (!user) return next(new CustomError('User not found', 401));


  const secureUser:SecureUserInfo = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    accessToken: token,
    role:"68c2bf34749d79f42291f35a",
    assignedSupportDeveloperId: user.assignedSupportDeveloperId?._id.toString() || ""
  }
  req.user = secureUser
  next();
});