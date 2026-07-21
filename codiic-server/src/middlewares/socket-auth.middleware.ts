import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Socket } from "socket.io";
import { SUPER_ADMIN_TOKEN } from "../constants";
import { User } from "../models/user.model";


export interface UserJwtDecode {
    uid: string;
    role: string;
    email: string;
}


export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.headers.token as string;
  if (!token) return next(new Error("Token missing, please login again"));

  if (token === SUPER_ADMIN_TOKEN) {
    socket.user = {
      id: new mongoose.Types.ObjectId().toString(),
      name: "Super Admin",
      email: "superadmin@gmail.com",
      role: "super-admin",
      assignedSupportDeveloperId: '',
      accessToken: token,
      superAdmin:true
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserJwtDecode;

    if (!decoded.uid) return next(new Error("Invalid token, please login again"));

    const user = await User.findById(decoded.uid)
    if (!user) return next(new Error("Invalid token, please login again"));

    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role.toString() as string,
      assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || '',
      accessToken: token,
      superAdmin:false
    };
    next();
  } catch (err) {
    console.error(`Socket ${socket.id}: Authentication error:`, err);
    next(new Error("Authentication failed"));
  }
};