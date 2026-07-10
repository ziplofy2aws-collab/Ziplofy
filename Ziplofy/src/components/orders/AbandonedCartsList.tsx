import React from 'react';
import AbandonedCartCard from './AbandonedCartCard';

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

interface AbandonedCartsListProps {
  carts: Cart[];
  getInitials: (firstName: string, lastName: string) => string;
  formatDate: (dateString: string) => string;
  onSendEmail: (customer: Customer) => void;
  onViewDetails: (customerId: string) => void;
  onViewCustomer: (customerId: string) => void;
}

const AbandonedCartsList: React.FC<AbandonedCartsListProps> = ({
  carts,
  getInitials,
  formatDate,
  onSendEmail,
  onViewDetails,
  onViewCustomer,
}) => {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm"
      aria-labelledby="abandoned-carts-heading"
    >
      <h2 id="abandoned-carts-heading" className="sr-only">
        Abandoned cart list
      </h2>

      <div className="flex flex-col gap-1 border-b border-gray-100 bg-linear-to-r from-gray-50/90 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">All abandoned carts</p>
          <p className="text-xs text-gray-500">Sorted by most recently updated</p>
        </div>
        <p className="text-xs font-medium text-gray-500">
          {carts.length} {carts.length === 1 ? 'record' : 'records'}
        </p>
      </div>

      <div className="hidden border-b border-gray-100 bg-gray-50/50 px-5 py-2.5 lg:grid lg:grid-cols-12 lg:gap-4 lg:px-6">
        <div className="col-span-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Customer</div>
        <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Cart</div>
        <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Last activity</div>
        <div className="col-span-2 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Actions
        </div>
      </div>

      <ul className="divide-y divide-gray-100 p-3 sm:p-4 lg:p-0 lg:px-2 lg:pb-3" aria-label="Abandoned carts">
        {carts.map((cart) => (
          <li key={cart.customer._id} className="lg:px-2 lg:py-1">
            <AbandonedCartCard
              cart={cart}
              getInitials={getInitials}
              formatDate={formatDate}
              onSendEmail={onSendEmail}
              onViewDetails={onViewDetails}
              onViewCustomer={onViewCustomer}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AbandonedCartsList;
