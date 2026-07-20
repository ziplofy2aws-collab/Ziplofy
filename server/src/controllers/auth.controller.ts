import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/user';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { createDefaultResourcesForNewUser } from '../utils/store.utils';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface JwtPayload {
    uid: string;
    role: string;
    email: string;
}

export interface SecureUserInfo {
    id: string;
    email: string;
    role: string;
    name: string;
    accessToken: string;
    assignedSupportDeveloperId: string | null;
}

export const signAccessToken = (user: IUser): string => {  
    const payload: JwtPayload = {
      uid: user._id.toString(),
      role: "client",
      email: user.email
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });  
};

export const register = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as Pick<IUser, 'name' | 'email'> & { password: string };
    const existingUser = await User.findOne({ email });

    if (existingUser) return next(new CustomError('User already exists', 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      hashedPassword,
      role: "68c2bf34749d79f42291f35a",
      status: 'Active',
      totalPurchases: 0
    });

    await createDefaultResourcesForNewUser(user);

    const token = signAccessToken(user);

    const response: SecureUserInfo = {
      id: user._id.toString(),
      email: user.email,
      role: "client",
      name: user.name,
      accessToken: token,
      assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || "",
    };

    return res.status(201).json(response);
});

export const login = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {

  const { email, password } = req.body as Pick<IUser, 'email'> & { password: string };
  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError('Invalid credentials', 400));
  }

  if (!(await bcrypt.compare(password, user.hashedPassword!))) {
    return next(new CustomError('Invalid credentials', 400));
  }

  const access = signAccessToken(user);

  const response: SecureUserInfo = {
    id: user._id.toString(),
    email: user.email,
    role: "client",
    name: user.name,
    accessToken: access,
    assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || "",
  };
  return res.status(200).json(response);
});

export const googleAuth = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { credential } = req.body as { credential: string };

    if (!credential) return next(new CustomError('No credential provided', 400));
    if (!process.env.GOOGLE_CLIENT_ID) return next(new CustomError('GOOGLE_CLIENT_ID is not configured', 500));
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) return next(new CustomError('Invalid Google token', 401));
    if (!payload.email) return next(new CustomError('Google account email is required', 400));
    

    let user: IUser | null = await User.findOne({ email: payload.email });

    if (!user) {
      const name = payload.name || payload.email?.split('@')[0] || 'User';
      user = await User.create({
        email: payload.email,
        name,
        provider: 'google',
        googleId: payload.sub,
        status: 'Active',
        role: "68c2bf34749d79f42291f35a",
      });

      await createDefaultResourcesForNewUser(user);
    } else if (user.provider !== 'google') {
      await User.updateOne(
        { _id: user._id },
        { $set: { provider: 'google', googleId: payload.sub } }
      );
    }

    const access = signAccessToken(user);

    const response: SecureUserInfo = {
      id: user._id.toString(),
      email: user.email,
      role: "client",
      name: user.name,
      accessToken: access,
      assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || "",
    };

    return res.status(200).json(response);
});

export const me = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json(req.user);
});
