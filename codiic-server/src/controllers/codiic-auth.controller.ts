import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { CodiicUser, ICodiicUser } from '../models/codiic-user.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { createDefaultResourcesForNewUser } from '../utils/client-store-bootstrap.util';

/**
 * Client (store-owner) authentication, merged in from the former standalone `server` service.
 * Handles email/password register + login and Google sign-in for the Ziplofy dashboard.
 * Admin/super-admin auth continues to live in `auth.controller.ts`.
 */

// Default "client" role id (store owner). Matches the role used by the former server service.
const CLIENT_ROLE_ID = '68c2bf34749d79f42291f35a';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface SecureUserInfo {
  id: string;
  email: string;
  role: string;
  name: string;
  accessToken: string;
  assignedSupportDeveloperId: string;
}

const signAccessToken = (user: ICodiicUser): string => {
  const payload = {
    uid: user._id.toString(),
    role: 'client',
    email: user.email,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '7d' });
};

const toSecureUser = (user: ICodiicUser, accessToken: string): SecureUserInfo => ({
  id: user._id.toString(),
  email: user.email,
  role: 'client',
  name: user.name,
  accessToken,
  assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || '',
});

export const register = asyncErrorHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  if (!name || !email || !password) {
    throw new CustomError('Name, email and password are required', 400);
  }

  const existingUser = await CodiicUser.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new CustomError('User already exists', 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await CodiicUser.create({
    name,
    email,
    hashedPassword,
    provider: 'local',
    role: new mongoose.Types.ObjectId(CLIENT_ROLE_ID),
    status: 'Active',
    totalPurchases: 0,
  });

  await createDefaultResourcesForNewUser(user);

  const token = signAccessToken(user);
  return res.status(201).json(toSecureUser(user, token));
});

export const login = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) throw new CustomError('Email and password are required', 400);

  const user = await CodiicUser.findOne({ email: email.toLowerCase() });
  if (!user) throw new CustomError('Invalid credentials', 400);

  // Support legacy accounts stored under `password` as well as `hashedPassword`.
  const storedHash = user.hashedPassword || (user as unknown as { password?: string }).password;
  if (!storedHash || !(await bcrypt.compare(password, storedHash))) {
    throw new CustomError('Invalid credentials', 400);
  }

  const token = signAccessToken(user);
  return res.status(200).json(toSecureUser(user, token));
});

export const googleAuth = asyncErrorHandler(async (req: Request, res: Response) => {
  const { credential } = req.body as { credential: string };

  if (!credential) throw new CustomError('No credential provided', 400);
  if (!process.env.GOOGLE_CLIENT_ID) throw new CustomError('GOOGLE_CLIENT_ID is not configured', 500);

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new CustomError('Invalid Google token', 401);
  if (!payload.email) throw new CustomError('Google account email is required', 400);

  let user = await CodiicUser.findOne({ email: payload.email.toLowerCase() });

  if (!user) {
    const name = payload.name || payload.email.split('@')[0] || 'User';
    user = await CodiicUser.create({
      email: payload.email,
      name,
      provider: 'google',
      googleId: payload.sub,
      status: 'Active',
      role: new mongoose.Types.ObjectId(CLIENT_ROLE_ID),
    });

    await createDefaultResourcesForNewUser(user);
  } else if (user.provider !== 'google') {
    await CodiicUser.updateOne(
      { _id: user._id },
      { $set: { provider: 'google', googleId: payload.sub } }
    );
  }

  const token = signAccessToken(user);
  return res.status(200).json(toSecureUser(user, token));
});
