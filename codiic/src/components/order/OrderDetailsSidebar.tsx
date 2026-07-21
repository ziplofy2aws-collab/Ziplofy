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

const OrderDetailsSidebar: React.FC<OrderDetailsSidebarProps> = ({ order, customerOrderCount }) => {
  const shippingLines = formatAddressLines(order.shippingAddressId);
  const billingSameAsShipping = addressesAreSame(order.shippingAddressId, order.billingAddressId);
  const billingLines = billingSameAsShipping ? [] : formatAddressLines(order.billingAddressId);

  return (
    <div className="space-y-4">
      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
          <button
            type="button"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Edit notes"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm text-gray-600">{order.notes?.trim() || 'No notes from customer'}</p>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
          <button
            type="button"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Customer actions"
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-4 py-3 text-sm">
          <div>
            {order.customerId?._id ? (
              <Link to={`/customers/${order.customerId._id}`} className="font-medium text-blue-700 hover:underline">
                {getCustomerDisplayName(order.customerId)}
              </Link>
            ) : (
              <p className="font-medium text-gray-900">{getCustomerDisplayName(order.customerId)}</p>
            )}
            {customerOrderCount != null && customerOrderCount > 0 ? (
              <p className="mt-0.5 text-blue-700">
                <Link to={`/customers/${order.customerId?._id}`} className="hover:underline">
                  {customerOrderCount} order{customerOrderCount === 1 ? '' : 's'}
                </Link>
              </p>
            ) : null}
            {order.customerId?.email ? (
              <a href={`mailto:${order.customerId.email}`} className="mt-1 block text-blue-700 hover:underline">
                {order.customerId.email}
              </a>
            ) : null}
          </div>

          {shippingLines.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-900">Shipping address</p>
              <div className="space-y-0.5 text-gray-700">
                {shippingLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button type="button" className="mt-2 text-sm text-blue-700 hover:underline">
                View map
              </button>
            </div>
          ) : null}

          <div>
            <p className="mb-1 text-xs font-semibold text-gray-900">Billing address</p>
            {billingSameAsShipping ? (
              <p className="text-gray-700">Same as shipping address</p>
            ) : billingLines.length > 0 ? (
              <div className="space-y-0.5 text-gray-700">
                {billingLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">—</p>
            )}
          </div>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Conversion summary</h2>
        </div>
        <div className="space-y-3 px-4 py-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <HandRaisedIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
            <span>Conversion details are not available yet</span>
          </div>
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
            <span>Session data will appear here when tracking is enabled</span>
          </div>
          <div className="flex items-start gap-2">
            <ChartBarIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
            <span>Attribution summary is not configured</span>
          </div>
          <button type="button" className="text-sm text-blue-700 hover:underline">
            View conversion details
          </button>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Order risk</h2>
          <DocumentMagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="px-4 py-3">
          <p className="text-sm text-gray-500">Analysis not available</p>
        </div>
      </div>

      <div className={orderCardClass}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Tags</h2>
          <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Edit tags">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            disabled
            placeholder=""
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSidebar;
