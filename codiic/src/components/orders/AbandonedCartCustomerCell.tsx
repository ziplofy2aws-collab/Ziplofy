import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  computeFloatingPopoverPosition,
  getFloatingPopoverRoot,
} from './floating-popover.util';

const POPOVER_WIDTH = 300;
const POPOVER_GAP = 4;

export type AbandonedCartCustomerSummary = {
  customerId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  cartItemCount: number;
  cartValue: number;
};

type AbandonedCartCustomerCellProps = {
  rowId: string;
  customer: AbandonedCartCustomerSummary;
  isOpen: boolean;
  onToggle: (rowId: string) => void;
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const AbandonedCartCustomerCell: React.FC<AbandonedCartCustomerCellProps> = ({
  rowId,
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
      onToggle(rowId);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle(rowId);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onToggle, rowId]);

  const handleToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onToggle(rowId);
    },
    [onToggle, rowId]
  );

  const handleViewCustomer = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      navigate(`/customers/${customer.customerId}`);
      onToggle(rowId);
    },
    [customer.customerId, navigate, onToggle, rowId]
  );

  const itemLabel = `${customer.cartItemCount} item${customer.cartItemCount === 1 ? '' : 's'} in cart`;

  const popover =
    isOpen && position && mounted ? (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Customer details"
        className="fixed z-[6000] overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-xl"
        style={{
          top: position.top,
          left: position.left,
          width: POPOVER_WIDTH,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 px-4 py-3">
          <p className="text-[14px] font-semibold text-admin-text">{customer.name}</p>
          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="inline-block text-[13px] text-[#005bd3] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.email}
            </a>
          ) : null}
          {customer.phoneNumber ? (
            <p className="text-[13px] text-admin-text-secondary">{customer.phoneNumber}</p>
          ) : null}
          <p className="text-[13px] text-admin-text-secondary">{itemLabel}</p>
          <p className="text-[13px] text-admin-text-secondary">{formatCurrency(customer.cartValue)} cart value</p>
        </div>
        <div className="border-t border-admin-divider px-4 py-3">
          <button
            type="button"
            onClick={handleViewCustomer}
            className="w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover"
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
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-admin-text transition-colors ${
          isOpen ? 'bg-admin-secondary' : 'hover:bg-admin-secondary'
        }`}
      >
        {customer.name}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-admin-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {popover ? createPortal(popover, getFloatingPopoverRoot()) : null}
    </>
  );
};

export default AbandonedCartCustomerCell;
