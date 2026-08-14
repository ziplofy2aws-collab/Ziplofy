import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Socket } from 'socket.io';
import { SUPER_ADMIN_TOKEN } from '../constants';
import { User } from '../models/user.model';

export interface UserJwtDecode {
  uid: string;
  role: string;
  email: string;
}

function isStorefrontHandshake(socket: Socket): boolean {
  const authRole =
    typeof socket.handshake.auth?.clientRole === 'string'
      ? socket.handshake.auth.clientRole
      : '';
  const headerRole = socket.handshake.headers['x-client-role'];
  const header =
    typeof headerRole === 'string'
      ? headerRole
      : Array.isArray(headerRole)
        ? headerRole[0]
        : '';
  return authRole === 'storefront' || header === 'storefront';
}

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  if (isStorefrontHandshake(socket)) {
    socket.user = {
      id: `storefront:${socket.id}`,
      name: 'Storefront Visitor',
      email: '',
      role: 'storefront',
      assignedSupportDeveloperId: '',
      accessToken: '',
      superAdmin: false,
      storefront: true,
    };
    return next();
  }

  const token = socket.handshake.headers.token as string;
  if (!token) return next(new Error('Token missing, please login again'));

  if (token === SUPER_ADMIN_TOKEN) {
    socket.user = {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      role: 'super-admin',
      assignedSupportDeveloperId: '',
      accessToken: token,
      superAdmin: true,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserJwtDecode;

    if (!decoded.uid) return next(new Error('Invalid token, please login again'));

    const user = await User.findById(decoded.uid);
    if (!user) return next(new Error('Invalid token, please login again'));

    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role.toString() as string,
      assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || '',
      accessToken: token,
      superAdmin: false,
    };
    next();
  } catch (err) {
    console.error(`Socket ${socket.id}: Authentication error:`, err);
    next(new Error('Authentication failed'));
  }
};
