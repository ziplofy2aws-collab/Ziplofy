import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  computeFloatingPopoverPosition,
  getFloatingPopoverRoot,
} from './floating-popover.util';
import type { OrderCustomerSummary } from './orders-table.types';

const POPOVER_WIDTH = 300;
const POPOVER_GAP = 4;

type OrderCustomerCellProps = {
  orderId: string;
  customer: OrderCustomerSummary;
  isOpen: boolean;
  onToggle: (orderId: string) => void;
};

const OrderCustomerCell: React.FC<OrderCustomerCellProps> = ({
  orderId,
  customer,
  isOpen,
  onToggle,
}) => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<ReturnType<typeof computeFloatingPopoverPosition> | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const anchor = buttonRef.current?.getBoundingClientRect();
    if (!anchor) return;
    setPosition(computeFloatingPopoverPosition(anchor, POPOVER_WIDTH, POPOVER_GAP, 120));
  }, []);

  useEffect(() => {
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
      if (!customer.customerId) return;
      onToggle(orderId);
    },
    [customer.customerId, onToggle, orderId]
  );

  const handleViewCustomer = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!customer.customerId) return;
      navigate(`/customers/${customer.customerId}`);
      onToggle(orderId);
    },
    [customer.customerId, navigate, onToggle, orderId]
  );

  if (!customer.customerId) {
    return <span className="text-[13px] text-gray-700">{customer.name}</span>;
  }

  const orderCountLabel = `${customer.orderCount} order${customer.orderCount === 1 ? '' : 's'}`;

  const popover =
    isOpen && position && mounted ? (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Customer details"
        className="fixed z-[6000] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        style={{
          top: position.top,
          left: position.left,
          width: POPOVER_WIDTH,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 px-4 py-3">
          <p className="text-[14px] font-semibold text-gray-900">{customer.name}</p>
          {customer.location ? (
            <p className="text-[13px] text-gray-600">{customer.location}</p>
          ) : null}
          <p className="text-[13px] text-gray-600">{orderCountLabel}</p>
          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="inline-block text-[13px] text-blue-600 hover:text-blue-700 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.email}
            </a>
          ) : null}
        </div>
        <div className="border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={handleViewCustomer}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            View customer
          </button>
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
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-gray-900 transition-colors ${
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
        }`}
      >
        {customer.name}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {popover ? createPortal(popover, getFloatingPopoverRoot()) : null}
    </>
  );
};

export default OrderCustomerCell;
