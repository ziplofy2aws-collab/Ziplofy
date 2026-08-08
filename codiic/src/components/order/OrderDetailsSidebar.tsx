import {
  ChartBarIcon,
  DocumentMagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  HandRaisedIcon,
  InformationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import { adminListFooterLinkClass } from '../admin-list-ui';
import type { AdminOrder } from '../../contexts/admin-order.context';
import {
  addressesAreSame,
  formatAddressLines,
  getCustomerDisplayName,
  orderCardClass,
} from '../../utils/order-details.util';

interface OrderDetailsSidebarProps {
  order: AdminOrder;
  customerOrderCount?: number;
}

const iconBtnClass =
  'rounded p-1 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text';

const OrderDetailsSidebar: React.FC<OrderDetailsSidebarProps> = ({ order, customerOrderCount }) => {
  const shippingLines = formatAddressLines(order.shippingAddressId);
  const billingSameAsShipping = addressesAreSame(order.shippingAddressId, order.billingAddressId);
  const billingLines = billingSameAsShipping ? [] : formatAddressLines(order.billingAddressId);

  return (
    <div className="space-y-4">
      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-admin-divider px-4 py-3">
          <h2 className="text-[13px] font-semibold text-admin-text">Notes</h2>
          <button type="button" className={iconBtnClass} aria-label="Edit notes">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] text-admin-text-secondary">
            {order.notes?.trim() || 'No notes from customer'}
          </p>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-admin-divider px-4 py-3">
          <h2 className="text-[13px] font-semibold text-admin-text">Customer</h2>
          <button type="button" className={iconBtnClass} aria-label="Customer actions">
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-4 py-3 text-[13px]">
          <div>
            {order.customerId?._id ? (
              <Link
                to={`/customers/${order.customerId._id}`}
                className={`font-medium ${adminListFooterLinkClass}`}
              >
                {getCustomerDisplayName(order.customerId)}
              </Link>
            ) : (
              <p className="font-medium text-admin-text">{getCustomerDisplayName(order.customerId)}</p>
            )}
            {customerOrderCount != null && customerOrderCount > 0 ? (
              <p className="mt-0.5">
                <Link
                  to={`/customers/${order.customerId?._id}`}
                  className={adminListFooterLinkClass}
                >
                  {customerOrderCount} order{customerOrderCount === 1 ? '' : 's'}
                </Link>
              </p>
            ) : null}
            {order.customerId?.email ? (
              <a
                href={`mailto:${order.customerId.email}`}
                className={`mt-1 block ${adminListFooterLinkClass}`}
              >
                {order.customerId.email}
              </a>
            ) : null}
          </div>

          {shippingLines.length > 0 ? (
            <div>
              <p className="mb-1 text-[12px] font-semibold text-admin-text">Shipping address</p>
              <div className="space-y-0.5 text-admin-text-secondary">
                {shippingLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button type="button" className={`mt-2 text-[13px] ${adminListFooterLinkClass}`}>
                View map
              </button>
            </div>
          ) : null}

          <div>
            <p className="mb-1 text-[12px] font-semibold text-admin-text">Billing address</p>
            {billingSameAsShipping ? (
              <p className="text-admin-text-secondary">Same as shipping address</p>
            ) : billingLines.length > 0 ? (
              <div className="space-y-0.5 text-admin-text-secondary">
                {billingLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-admin-text-subdued">—</p>
            )}
          </div>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="border-b border-admin-divider px-4 py-3">
          <h2 className="text-[13px] font-semibold text-admin-text">Conversion summary</h2>
        </div>
        <div className="space-y-3 px-4 py-3 text-[13px] text-admin-text-secondary">
          <div className="flex items-start gap-2">
            <HandRaisedIcon className="mt-0.5 h-4 w-4 shrink-0 text-admin-text-subdued" />
            <span>Conversion details are not available yet</span>
          </div>
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-admin-text-subdued" />
            <span>Session data will appear here when tracking is enabled</span>
          </div>
          <div className="flex items-start gap-2">
            <ChartBarIcon className="mt-0.5 h-4 w-4 shrink-0 text-admin-text-subdued" />
            <span>Attribution summary is not configured</span>
          </div>
          <button type="button" className={`text-[13px] ${adminListFooterLinkClass}`}>
            View conversion details
          </button>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-admin-divider px-4 py-3">
          <h2 className="text-[13px] font-semibold text-admin-text">Order risk</h2>
          <DocumentMagnifyingGlassIcon className="h-4 w-4 text-admin-text-subdued" />
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] text-admin-text-subdued">Analysis not available</p>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-admin-divider px-4 py-3">
          <h2 className="text-[13px] font-semibold text-admin-text">Tags</h2>
          <button type="button" className={iconBtnClass} aria-label="Edit tags">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            disabled
            placeholder=""
            className="w-full rounded-md border border-admin-border bg-admin-secondary px-3 py-2 text-[13px] text-admin-text-subdued"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSidebar;
