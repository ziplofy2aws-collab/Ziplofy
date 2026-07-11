import { UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerPrimaryButtonClass } from './customer-ui.util';

const CustomersPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleAddCustomer = useCallback(() => {
    navigate('/customers/new');
  }, [navigate]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <UserGroupIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Customers</h1>
      </div>

      <button type="button" onClick={handleAddCustomer} className={customerPrimaryButtonClass}>
        Add customer
      </button>
    </div>
  );
};

export default CustomersPageHeader;
