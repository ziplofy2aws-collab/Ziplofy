import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Customer } from '../../contexts/customer.context';
import { useCustomers } from '../../contexts/customer.context';
import { useStore } from '../../contexts/store.context';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Modal from '../Modal';
import {
  segmentInputClass,
  segmentPrimaryButtonClass,
  segmentSecondaryButtonClass,
} from './customer-segment-ui.util';

interface AddCustomerToSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
  onSelectedCustomerChange: (customer: Customer | null) => void;
  excludeCustomerIds?: string[];
  canSave: boolean;
  onSave: () => void;
}

function customerLabel(customer: Customer): string {
  const name = `${customer.firstName} ${customer.lastName}`.trim();
  if (name) return name;
  return customer.email || 'Customer';
}

const AddCustomerToSegmentModal: React.FC<AddCustomerToSegmentModalProps> = ({
  isOpen,
  onClose,
  selectedCustomer,
  onSelectedCustomerChange,
  excludeCustomerIds = [],
  canSave,
  onSave,
}) => {
  const { activeStoreId } = useStore();
  const {
    customerSearchResults,
    customerSearchLoading,
    searchCustomers,
    clearCustomerSearchResults,
  } = useCustomers();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const excludedIds = useMemo(() => new Set(excludeCustomerIds), [excludeCustomerIds]);

  useEffect(() => {
    if (!isOpen) return;
    if (!activeStoreId || !debouncedQuery.trim()) {
      clearCustomerSearchResults();
      return;
    }
    void searchCustomers(activeStoreId, debouncedQuery.trim(), 1, 20);
  }, [activeStoreId, clearCustomerSearchResults, debouncedQuery, isOpen, searchCustomers]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      clearCustomerSearchResults();
    }
  }, [clearCustomerSearchResults, isOpen]);

  const filteredCustomers = useMemo(() => {
    return customerSearchResults.filter((customer) => !excludedIds.has(customer._id));
  }, [customerSearchResults, excludedIds]);

  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      onSelectedCustomerChange(customer);
      setQuery('');
    },
    [onSelectedCustomerChange]
  );

  const handleClearCustomer = useCallback(() => {
    onSelectedCustomerChange(null);
    setQuery('');
  }, [onSelectedCustomerChange]);

  const showResults = !selectedCustomer && query.trim().length > 0;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add customer to segment"
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onClose} className={segmentSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={segmentPrimaryButtonClass}
          >
            Add customer
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="segment-customer-search" className="mb-1.5 block text-[13px] font-medium text-gray-700">
          Customer
        </label>

        {selectedCustomer ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-gray-900">
                {customerLabel(selectedCustomer)}
              </p>
              {selectedCustomer.email ? (
                <p className="truncate text-[12px] text-gray-500">{selectedCustomer.email}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleClearCustomer}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
              aria-label="Clear selected customer"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="segment-customer-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className={`${segmentInputClass} pl-9`}
              autoComplete="off"
            />
          </div>
        )}

        {showResults ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {customerSearchLoading ? (
              <div className="px-4 py-3 text-[13px] text-gray-500">Searching customers...</div>
            ) : filteredCustomers.length > 0 ? (
              <ul className="max-h-56 overflow-y-auto py-1">
                {filteredCustomers.map((customer) => (
                  <li key={customer._id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className="flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="text-[13px] font-medium text-gray-900">
                        {customerLabel(customer)}
                      </span>
                      {customer.email ? (
                        <span className="text-[12px] text-gray-500">{customer.email}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-[13px] text-gray-500">No customers found</div>
            )}
          </div>
        ) : null}

        {!selectedCustomer && !query.trim() ? (
          <p className="mt-2 text-[12px] text-gray-500">
            Type a customer name or email to search your store.
          </p>
        ) : null}
      </div>
    </Modal>
  );
};

export default AddCustomerToSegmentModal;
