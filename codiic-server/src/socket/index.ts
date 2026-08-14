import { Socket, Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { userIdToSocketIdMap } from '..';
import { SecureUserInfo } from '../middlewares/auth.middleware';
import {
  ISuperAdminNotification,
  SuperAdminNotification,
} from '../models/superadmin-notifications.model';
import { Order } from '../models/order/order.model';
import { SocketEventType } from '../types/event.types';
import { detectDeviceFromUserAgent, normalizeDeviceType } from './presence/device.util';
import { getSocketClientIp, lookupIpGeo } from './presence/geo.util';
import {
  analyticsRoom,
  getLiveSession,
  getLiveSessionsSnapshot,
  normalizeFunnelStage,
  normalizeVisitorType,
  removeLiveSession,
  upsertLiveSession,
  type LiveSessionsSnapshot,
  type LiveVisitorType,
} from './presence/live-sessions.presence';
import { getLiveCommerceSnapshot } from './presence/live-commerce.presence';
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
  };
}

type ClientSessionJoinPayload = {
  storeId?: string;
  sessionId?: string;
  deviceType?: string;
  /** Funnel stage for Live View customer behavior. */
  stage?: string;
  /** New vs returning for Live View. */
  visitorType?: string;
  /** Logged-in storefront customer id — used to detect prior orders. */
  customerId?: string;
};

type AnalyticsSubscribePayload = {
  storeId?: string;
};

function emitStoreSessionsUpdate(io: SocketIOServer, storeId: string): void {
  const snapshot: LiveSessionsSnapshot = getLiveSessionsSnapshot(storeId);
  io.to(analyticsRoom(storeId)).emit(SocketEventType.StoreSessionsUpdate, snapshot);
}

async function resolveVisitorType(params: {
  storeId: string;
  rawVisitorType: unknown;
  customerId?: string;
  prevType?: LiveVisitorType;
}): Promise<LiveVisitorType> {
  const fromClient =
    normalizeVisitorType(params.rawVisitorType) ?? params.prevType ?? 'new';

  const customerId =
    typeof params.customerId === 'string' ? params.customerId.trim() : '';
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
    return fromClient;
  }

  try {
    const hasPriorOrder = await Order.exists({
      storeId: params.storeId,
      customerId,
      status: { $ne: 'cancelled' },
    });
    if (hasPriorOrder) return 'returning';
  } catch {
    // Fall through to client classification on lookup failure.
  }

  return fromClient;
}

async function handleClientSessionJoin(
  io: SocketIOServer,
  socket: Socket,
  raw: ClientSessionJoinPayload,
) {
  const storeId = typeof raw?.storeId === 'string' ? raw.storeId.trim() : '';
  if (!storeId) return;

  const sessionId =
    typeof raw?.sessionId === 'string' && raw.sessionId.trim()
      ? raw.sessionId.trim()
      : socket.id;

  const prev = getLiveSession(socket.id);
  const uaHeader = socket.handshake.headers['user-agent'];
  const ua = typeof uaHeader === 'string' ? uaHeader : Array.isArray(uaHeader) ? uaHeader[0] : '';
  const device =
    normalizeDeviceType(raw?.deviceType) ??
    prev?.device ??
    detectDeviceFromUserAgent(ua);

  const ip = getSocketClientIp(
    socket.handshake.headers as Record<string, unknown>,
    socket.handshake.address,
  );
  const location = prev?.location ?? lookupIpGeo(ip);
  const stage = normalizeFunnelStage(raw?.stage) ?? prev?.stage ?? 'browsing';
  const visitorType = await resolveVisitorType({
    storeId,
    rawVisitorType: raw?.visitorType,
    customerId: raw?.customerId,
    prevType: prev?.visitorType,
  });

  upsertLiveSession(socket.id, {
    storeId,
    sessionId,
    device,
    location,
    stage,
    visitorType,
    joinedAt: prev?.joinedAt ?? Date.now(),
  });

  emitStoreSessionsUpdate(io, storeId);
}

export function registerSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    const socketUser = socket.user as SecureUserInfo & {
      superAdmin?: boolean;
      storefront?: boolean;
    };

    if (!socketUser) {
      socket.disconnect(true);
      return;
    }

    sendWelcomeEvent(socket, socketUser);

    if (socketUser.superAdmin) superAdminSocketId = socket.id;

    if (!socketUser.storefront) {
      userIdToSocketIdMap.set(socketUser.id, socket.id);
    }

    socket.on(SocketEventType.ClientSessionJoin, (payload: ClientSessionJoinPayload) => {
      if (!socketUser.storefront) return;
      void handleClientSessionJoin(io, socket, payload || {});
    });

    socket.on(SocketEventType.ClientSessionLeave, () => {
      if (!socketUser.storefront) return;
      const storeId = removeLiveSession(socket.id);
      if (storeId) emitStoreSessionsUpdate(io, storeId);
    });

    socket.on(SocketEventType.AnalyticsSubscribe, (payload: AnalyticsSubscribePayload) => {
      if (socketUser.storefront) return;
      const storeId = typeof payload?.storeId === 'string' ? payload.storeId.trim() : '';
      if (!storeId) return;
      void socket.join(analyticsRoom(storeId));
      socket.emit(SocketEventType.StoreSessionsUpdate, getLiveSessionsSnapshot(storeId));
      socket.emit(SocketEventType.StoreLiveCommerceUpdate, getLiveCommerceSnapshot(storeId));
    });

    socket.on(SocketEventType.AnalyticsUnsubscribe, (payload: AnalyticsSubscribePayload) => {
      if (socketUser.storefront) return;
      const storeId = typeof payload?.storeId === 'string' ? payload.storeId.trim() : '';
      if (!storeId) return;
      void socket.leave(analyticsRoom(storeId));
    });

    socket.on(SocketEventType.HireDeveloper, async () => {
      if (socketUser.storefront) return;

      const existingRequest = await SuperAdminNotification.findOne({
        notificationType: 'hireDeveloper',
        userId: socketUser.id,
      });

      if (existingRequest) {
        socket.emit(SocketEventType.HireDeveloper, {
          message: 'You have already requested a support developer, please wait.',
        });
        return;
      }

      const notification = (await SuperAdminNotification.create({
        notificationType: 'hireDeveloper',
        userId: socketUser.id,
      })) as ISuperAdminNotification;

      const populatedNotification = await SuperAdminNotification.findById(notification._id)
        .populate<{ userId: { _id: mongoose.Types.ObjectId; name: string; email: string } }>(
          'userId',
          'name email',
        )
        .lean();

      if (superAdminSocketId && populatedNotification) {
        const user = populatedNotification.userId;
        const payload: HireDeveloperPayloadType = {
          message: `${socketUser.name} has requested to hire a developer`,
          notification: {
            _id: String(populatedNotification._id),
            notificationType: populatedNotification.notificationType,
            userId: {
              _id: String(user._id),
              name: user.name,
              email: user.email,
            },
            createdAt: new Date(populatedNotification.createdAt).toISOString(),
            updatedAt: new Date(populatedNotification.updatedAt).toISOString(),
            __v: (populatedNotification as { __v?: number }).__v ?? 0,
            id: String(populatedNotification._id),
          },
        };
        io.to(superAdminSocketId).emit(SocketEventType.HireDeveloper, payload);
      }

      socket.emit(SocketEventType.HireDeveloper, {
        message: 'Your request has been sent to the developer!',
      });
    });

    socket.on(SocketEventType.EndMeeting, () => {});

    socket.on('disconnect', () => {
      if (!socketUser.storefront) {
        if (userIdToSocketIdMap.get(socketUser.id) === socket.id) {
          userIdToSocketIdMap.delete(socketUser.id);
        }
        console.log(`${socketUser.name} disconnected`);
      }

      const storeId = removeLiveSession(socket.id);
      if (storeId) emitStoreSessionsUpdate(io, storeId);
    });
  });
}
