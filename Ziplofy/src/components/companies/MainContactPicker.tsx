import { MagnifyingGlassIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Customer } from '../../contexts/customer.context';
import { useCustomers } from '../../contexts/customer.context';
import { useStore } from '../../contexts/store.context';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

type Props = {
  selectedContact: Customer | null;
  onSelectedContactChange: (customer: Customer | null) => void;
  onCreateNewCustomer?: () => void;
};

function contactLabel(customer: Customer): string {
  const name = `${customer.firstName} ${customer.lastName}`.trim();
  if (name) return name;
  return customer.email || 'Customer';
}

export default function MainContactPicker({
  selectedContact,
  onSelectedContactChange,
  onCreateNewCustomer,
}: Props) {
  const { activeStoreId } = useStore();
  const { customers, searchCustomers, loading, fetchCustomersByStoreId } = useCustomers();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
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
      const haystack =
        `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phoneNumber}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, query]);

  const handleSelectContact = useCallback(
    (customer: Customer) => {
      onSelectedContactChange(customer);
      setQuery('');
      setIsOpen(false);
    },
    [onSelectedContactChange]
  );

  const handleClearContact = useCallback(() => {
    onSelectedContactChange(null);
    setQuery('');
    setIsOpen(true);
  }, [onSelectedContactChange]);

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

  return (
    <div ref={containerRef} className="relative">
      {selectedContact ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-gray-900">{contactLabel(selectedContact)}</p>
            {selectedContact.email ? (
              <p className="truncate text-[12px] text-gray-500">{selectedContact.email}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClearContact}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
            aria-label="Remove main contact"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search"
            className={`${inputClass} pl-9 ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/30' : ''}`}
          />
        </div>
      )}

      {isOpen && !selectedContact ? (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCreateNewCustomer?.();
            }}
            className="flex w-full items-center gap-2 bg-gray-50 px-4 py-3 text-left text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100"
          >
            <PlusCircleIcon className="h-5 w-5 text-gray-500" aria-hidden />
            Add new customer
          </button>

          {loading ? (
            <div className="border-t border-gray-100 px-4 py-3 text-[13px] text-gray-500">
              Searching customers...
            </div>
          ) : filteredCustomers.length > 0 ? (
            <ul className="max-h-56 overflow-y-auto border-t border-gray-100 py-1">
              {filteredCustomers.map((customer) => (
                <li key={customer._id}>
                  <button
                    type="button"
                    onClick={() => handleSelectContact(customer)}
                    className="flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="text-[13px] font-medium text-gray-900">{contactLabel(customer)}</span>
                    {customer.email ? (
                      <span className="text-[12px] text-gray-500">{customer.email}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-t border-gray-100 px-4 py-3 text-[13px] text-gray-500">
              No customers found
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
