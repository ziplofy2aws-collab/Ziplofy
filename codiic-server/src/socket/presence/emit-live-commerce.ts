import type { Server as SocketIOServer } from 'socket.io';
import { SocketEventType } from '../../types/event.types';
import { analyticsRoom } from './live-sessions.presence';
import {
  getLiveCommerceSnapshot,
  recordLiveOrder,
  type LiveCommerceSnapshot,
  type LiveOrderLineItemInput,
} from './live-commerce.presence';

export function emitLiveCommerceSnapshot(
  io: SocketIOServer,
  storeId: string,
  snapshot?: LiveCommerceSnapshot,
): void {
  const data = snapshot ?? getLiveCommerceSnapshot(storeId);
  io.to(analyticsRoom(storeId)).emit(SocketEventType.StoreLiveCommerceUpdate, data);
}

/**
 * Increment live orders/sales (and per-product totals) for a store
 * and broadcast to Live View subscribers.
 */
export function emitLiveOrderPlaced(
  io: SocketIOServer,
  input: {
    storeId: string;
    salesAmount: number;
    orderId?: string;
    lineItems?: LiveOrderLineItemInput[];
  },
): LiveCommerceSnapshot {
  const snapshot = recordLiveOrder({
    storeId: input.storeId,
    salesAmount: input.salesAmount,
    lineItems: input.lineItems,
  });
  io.to(analyticsRoom(input.storeId)).emit(SocketEventType.StoreLiveCommerceUpdate, {
    ...snapshot,
    orderId: input.orderId,
    salesDelta: input.salesAmount,
  });
  return snapshot;
}
