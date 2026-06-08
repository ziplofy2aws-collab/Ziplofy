import {
  ArrowRightIcon,
  ClockIcon,
  CubeIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useMemo } from 'react';

interface CartItem {
  _id: string;
  productVariant: {
    images?: string[];
    sku: string;
    price: number;
    optionValues: Record<string, string>;
  };
  quantity: number;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface Cart {
  customer: Customer;
  totalItems: number;
  cartItems: CartItem[];
  lastUpdated: string;
}

interface AbandonedCartCardProps {
  cart: Cart;
  getInitials: (firstName: string, lastName: string) => string;
  formatDate: (dateString: string) => string;
  onSendEmail: (customer: Customer) => void;
  onViewDetails: (customerId: string) => void;
  onViewCustomer: (customerId: string) => void;
}

const AbandonedCartCard: React.FC<AbandonedCartCardProps> = ({
  cart,
  getInitials,
  formatDate,
  onSendEmail,
  onViewDetails,
  onViewCustomer,
}) => {
  const handleSendEmail = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSendEmail(cart.customer);
    },
    [cart.customer, onSendEmail]
  );

  const handleViewDetails = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onViewDetails(cart.customer._id);
    },
    [cart.customer._id, onViewDetails]
  );

  const handleViewCustomer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewCustomer(cart.customer._id);
    },
    [cart.customer._id, onViewCustomer]
  );

  const calculateTotal = useMemo(() => {
    return cart.cartItems.reduce((sum, item) => sum + item.productVariant.price * item.quantity, 0);
  }, [cart.cartItems]);

  const previewImages = useMemo(() => {
    const urls: string[] = [];
    for (const item of cart.cartItems) {
      const img = item.productVariant.images?.[0];
      if (img && urls.length < 4) urls.push(img);
    }
    return urls;
  }, [cart.cartItems]);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => handleViewDetails()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetails();
        }
      }}
      className="group cursor-pointer rounded-xl border border-transparent bg-white p-4 transition-all duration-200 hover:border-blue-200/80 hover:bg-blue-50/20 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:border-0 lg:bg-transparent lg:p-3 lg:hover:bg-gray-50/80 lg:hover:shadow-none"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center lg:gap-4">
        {/* Customer */}
        <div className="lg:col-span-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md ring-2 ring-blue-100">
              {getInitials(cart.customer.firstName, cart.customer.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={handleViewCustomer}
                className="text-left text-sm font-semibold text-gray-900 hover:text-blue-700 hover:underline"
              >
                {cart.customer.firstName} {cart.customer.lastName}
              </button>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                <EnvelopeIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                <span className="truncate">{cart.customer.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart summary */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-start lg:gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
              <CubeIcon className="h-3.5 w-3.5 text-gray-500" aria-hidden />
              {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
            </span>
            <p className="text-sm font-bold tabular-nums text-gray-900">
              ₹
              {calculateTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {previewImages.length > 0 ? (
              <div className="mt-1 flex -space-x-1.5">
                {previewImages.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative h-8 w-8 overflow-hidden rounded-md border-2 border-white bg-gray-100 shadow-sm"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {cart.cartItems.length > previewImages.length ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 shadow-sm">
                    +{cart.cartItems.length - previewImages.length}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Last activity */}
        <div className="flex flex-col gap-1 border-t border-gray-100 pt-4 lg:col-span-3 lg:border-t-0 lg:pt-0">
          <span className="text-xs font-medium text-gray-500 lg:hidden">Last activity</span>
          <span className="inline-flex items-center gap-2 text-sm text-gray-700 lg:text-[13px]">
            <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            {formatDate(cart.lastUpdated)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2 lg:flex-col lg:items-stretch xl:flex-row">
          <button
            type="button"
            onClick={handleSendEmail}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 sm:flex-1 lg:flex-none"
          >
            <PaperAirplaneIcon className="h-3.5 w-3.5 text-gray-500" aria-hidden />
            Recovery
          </button>
          <button
            type="button"
            onClick={(e) => handleViewDetails(e)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:flex-1 lg:flex-none"
          >
            Open
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
};

export default AbandonedCartCard;
