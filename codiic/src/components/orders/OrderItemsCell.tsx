import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAdminOrders } from '../../contexts/admin-order.context';
import { mapAdminOrderToLineItems } from './map-order-line-items';
import { FulfillmentStatusBadge, OrderItemsPopoverSkeleton } from './order-status-badges';
import {
  computeFloatingPopoverPosition,
  getFloatingPopoverRoot,
  type FloatingPopoverPosition,
} from './floating-popover.util';
import type { OrderFulfillmentStatus, OrderLineItemSummary } from './orders-table.types';

const POPOVER_WIDTH = 340;
const POPOVER_GAP = 4;

type OrderItemsCellProps = {
  orderId: string;
  itemCount: number;
  fulfillmentStatus: OrderFulfillmentStatus;
  deliveryMethod: string;
  lineItems: OrderLineItemSummary[];
  isOpen: boolean;
  onToggle: (orderId: string) => void;
};

const OrderItemsCell: React.FC<OrderItemsCellProps> = ({
  orderId,
  itemCount,
  fulfillmentStatus,
  deliveryMethod,
  lineItems,
  isOpen,
  onToggle,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { getOrderById } = useAdminOrders();
  const [resolvedItems, setResolvedItems] = useState<OrderLineItemSummary[]>(lineItems);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<FloatingPopoverPosition | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setResolvedItems(lineItems);
  }, [lineItems]);

  const updatePosition = useCallback(() => {
    const anchor = buttonRef.current?.getBoundingClientRect();
    if (!anchor) return;
    setPosition(computeFloatingPopoverPosition(anchor, POPOVER_WIDTH, POPOVER_GAP));
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updatePosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    if (lineItems.length > 0 || itemCount === 0) return;

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const order = await getOrderById(orderId);
        if (!cancelled && order) {
          setResolvedItems(mapAdminOrderToLineItems(order));
        }
      } catch {
        if (!cancelled) setResolvedItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, orderId, lineItems.length, itemCount, getOrderById]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      onToggle(orderId);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle(orderId);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onToggle, orderId]);

  const handleToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onToggle(orderId);
    },
    [onToggle, orderId]
  );

  const label = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;

  const popover =
    isOpen && position && mounted ? (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Order items"
        className="fixed z-[6000] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        style={{
          top: position.top,
          left: position.left,
          width: POPOVER_WIDTH,
          maxHeight: position.maxHeight,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-3 py-2.5">
          <FulfillmentStatusBadge status={fulfillmentStatus} />
        </div>

        <div className="border-b border-gray-100 bg-gray-50/80 px-3 py-2 text-[12px] font-medium text-gray-600">
          {deliveryMethod}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: Math.max(120, position.maxHeight - 88) }}>
          {loading ? (
            <OrderItemsPopoverSkeleton />
          ) : resolvedItems.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {resolvedItems.map((item) => (
                <li key={item.lineItemId} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link
                        to={`/products/${item.productId}`}
                        className="block truncate text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className="block truncate text-[13px] font-medium text-gray-900">
                        {item.title}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[13px] text-gray-600">× {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-[13px] text-gray-500">No items found</div>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-gray-700 transition-colors ${
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
        }`}
      >
        {label}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {popover ? createPortal(popover, getFloatingPopoverRoot()) : null}
    </>
  );
};

export default OrderItemsCell;
