import { EnvelopeIcon, IdentificationIcon, PhoneIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface AbandonedCartCustomerInfoProps {
  customer: {
    firstName: string;
    lastName: string;
    _id: string;
    email: string;
    phoneNumber?: string;
  };
  getInitials: (firstName: string, lastName: string) => string;
  onViewCustomer: (customerId: string) => void;
}

const AbandonedCartCustomerInfo: React.FC<AbandonedCartCustomerInfoProps> = ({
  customer,
  getInitials,
  onViewCustomer,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-linear-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex items-center gap-2">
          <IdentificationIcon className="h-4 w-4 text-blue-600" aria-hidden />
          <h3 className="text-sm font-semibold text-gray-900">Customer</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md ring-2 ring-blue-100">
            {getInitials(customer.firstName, customer.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onViewCustomer(customer._id)}
              className="text-left text-base font-semibold text-gray-900 hover:text-blue-700 hover:underline"
            >
              {customer.firstName} {customer.lastName}
            </button>
            <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
              <EnvelopeIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <span className="break-all">{customer.email}</span>
            </p>
            {customer.phoneNumber ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                {customer.phoneNumber}
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-500">
          ID · {customer._id}
        </p>
      </div>
    </div>
  );
};

export default AbandonedCartCustomerInfo;
