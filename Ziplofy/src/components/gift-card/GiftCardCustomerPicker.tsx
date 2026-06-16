import { MagnifyingGlassIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Customer } from '../../contexts/customer.context';
import { useCustomers } from '../../contexts/customer.context';
import { useStore } from '../../contexts/store.context';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { CreateGiftCardCustomerModal } from './CreateGiftCardCustomerModal';

type GiftCardCustomerPickerProps = {
  selectedCustomer: Customer | null;
  onSelectedCustomerChange: (customer: Customer | null) => void;
};

function customerLabel(customer: Customer): string {
  const name = `${customer.firstName} ${customer.lastName}`.trim();
  if (name) return name;
  return customer.email || 'Customer';
}

export function GiftCardCustomerPicker({
  selectedCustomer,
  onSelectedCustomerChange,
}: GiftCardCustomerPickerProps) {
  const { activeStoreId } = useStore();
  const { customers, searchCustomers, loading, fetchCustomersByStoreId } = useCustomers();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!activeStoreId) return;
    if (debouncedQuery.trim()) {
      void searchCustomers(activeStoreId, debouncedQuery.trim());
      return;
    }
    void fetchCustomersByStoreId(activeStoreId);
  }, [activeStoreId, debouncedQuery, fetchCustomersByStoreId, searchCustomers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter((customer) => {
      const haystack = `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phoneNumber}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, query]);

  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      onSelectedCustomerChange(customer);
      setQuery(customerLabel(customer));
      setIsOpen(false);
    },
    [onSelectedCustomerChange]
  );

  const handleClearCustomer = useCallback(() => {
    onSelectedCustomerChange(null);
    setQuery('');
    setIsOpen(true);
  }, [onSelectedCustomerChange]);

  const handleCustomerCreated = useCallback(
    (customer: Customer) => {
      handleSelectCustomer(customer);
    },
    [handleSelectCustomer]
  );

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';

  return (
    <>
      <div ref={containerRef} className="relative">
        {selectedCustomer ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{customerLabel(selectedCustomer)}</p>
              {selectedCustomer.email ? (
                <p className="truncate text-xs text-gray-500">{selectedCustomer.email}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleClearCustomer}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              aria-label="Remove customer"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search or create customer"
              className={`${inputClass} pl-9`}
            />
          </div>
        )}

        {isOpen && !selectedCustomer ? (
          <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(true);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              <PlusCircleIcon className="h-5 w-5 text-gray-500" />
              Create a new customer
            </button>

            <div className="border-t border-gray-100" />

            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Searching customers...</div>
            ) : filteredCustomers.length > 0 ? (
              <ul className="max-h-56 overflow-y-auto py-1">
                {filteredCustomers.map((customer) => (
                  <li key={customer._id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className="flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900">{customerLabel(customer)}</span>
                      {customer.email ? (
                        <span className="text-xs text-gray-500">{customer.email}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No customers found</div>
            )}
          </div>
        ) : null}
      </div>

      <CreateGiftCardCustomerModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}
