import { UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
} from '../components/admin-list-ui';
import CustomersPageFilters from '../components/customers/CustomersPageFilters';
import CustomersPageHeader from '../components/customers/CustomersPageHeader';
import CustomersTable from '../components/customers/CustomersTable';
import { useCustomers } from '../contexts/customer.context';
import { useStore } from '../contexts/store.context';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { customers, loading, error, fetchCustomersByStoreId } = useCustomers();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      fetchCustomersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchCustomersByStoreId]);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers ?? [];
    const q = search.toLowerCase();
    return (customers ?? []).filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phoneNumber?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleAddCustomer = useCallback(() => navigate('/customers/new'), [navigate]);
  const handleCustomerClick = useCallback(
    (id: string) => navigate(`/customers/${id}`),
    [navigate]
  );

  const hasCustomers = (customers ?? []).length > 0;
  const showInitialSkeleton = loading && !hasCustomers;

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <CustomersPageHeader />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <div className={adminListCardClass}>
          {showInitialSkeleton || hasCustomers ? (
            <CustomersPageFilters search={search} onSearchChange={setSearch} />
          ) : null}

          {showInitialSkeleton ? (
            <CustomersTable
              customers={[]}
              loading
              onCustomerClick={handleCustomerClick}
            />
          ) : !hasCustomers ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-admin-fill">
                <UserGroupIcon className="h-7 w-7 text-admin-text-subdued" aria-hidden />
              </div>
              <p className="text-[15px] font-semibold text-admin-text">No customers yet</p>
              <p className="mt-1.5 text-[13px] text-admin-text-secondary">
                Manage customer details, order history, and segments in one place.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={handleAddCustomer} className={adminListPrimaryButtonClass}>
                  Add customer
                </button>
              </div>
            </div>
          ) : (
            <CustomersTable customers={filteredCustomers} onCustomerClick={handleCustomerClick} />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Learn more about customers
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
