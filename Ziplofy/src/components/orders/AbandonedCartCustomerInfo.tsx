import React from 'react';

interface AbandonedCartCustomerInfoProps {
  customer: {
    firstName: string;
    lastName: string;
    _id: string;
    email: string;
    phoneNumber?: string;
  };
  onViewCustomer: (customerId: string) => void;
}

const AbandonedCartCustomerInfo: React.FC<AbandonedCartCustomerInfoProps> = ({
  customer,
  onViewCustomer,
}) => {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-gray-900">Customer</h2>
      </div>
      <div className="space-y-2 px-4 py-3 text-[13px]">
        <p className="font-medium text-gray-900">
          {customer.firstName} {customer.lastName}
        </p>
        <p className="break-all text-gray-600">{customer.email}</p>
        {customer.phoneNumber ? <p className="text-gray-600">{customer.phoneNumber}</p> : null}
        <button
          type="button"
          onClick={() => onViewCustomer(customer._id)}
          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
        >
          View customer
        </button>
      </div>
    </section>
  );
};

export default AbandonedCartCustomerInfo;
