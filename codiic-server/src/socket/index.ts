import { Socket, Server as SocketIOServer } from 'socket.io';
import { userIdToSocketIdMap } from '..';
import { SecureUserInfo } from '../middlewares/auth.middleware';
import { ISuperAdminNotification, SuperAdminNotification } from '../models/superadmin-notifications.model';
import { SocketEventType } from '../types/event.types';
import { sendWelcomeEvent, WelcomeEventPayloadType } from './utils';

let superAdminSocketId: string | null = null;

interface HireDeveloperPayloadType extends WelcomeEventPayloadType {
  notification: {
    _id: string;
    notificationType: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  }
}

export function registerSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {

    const socketUser = socket.user as SecureUserInfo & {superAdmin?:boolean};

    sendWelcomeEvent(socket, socketUser); 

    if(socketUser.superAdmin) superAdminSocketId = socket.id;

    userIdToSocketIdMap.set(socketUser.id, socket.id);

    socket.on(SocketEventType.HireDeveloper, async() => {
      // Check if a hire developer request already exists for this user
      const existingRequest = await SuperAdminNotification.findOne({
        notificationType: "hireDeveloper",
        userId: socketUser.id
      });

      if (existingRequest) {
      socket.emit(SocketEventType.HireDeveloper, {
       message:"You have already requested a support developer, please wait."
      });
      return;
      }

      const notification = await SuperAdminNotification.create({
        notificationType: "hireDeveloper",
        userId: socketUser.id,
      }) as ISuperAdminNotification

      // Populate the notification with user data
      const populatedNotification = await SuperAdminNotification.findById(notification._id)
        .populate('userId', 'name email')
        .lean();

      if(superAdminSocketId && populatedNotification) {
        const payload: HireDeveloperPayloadType = {
          message:`${socketUser.name} has requested to hire a developer`,
          notification: populatedNotification as any
        }
        io.to(superAdminSocketId).emit(SocketEventType.HireDeveloper, payload);
      }

      socket.emit(SocketEventType.HireDeveloper, {
        message:"Your request has been sent to the developer!"
      });
    });

    socket.on(SocketEventType.EndMeeting, () => {
      
    });

    socket.on('disconnect', () => {
      console.log(`${socketUser.name} disconnected`);
    });
    
  });
}