import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomers } from '../contexts/customer.context';
import { useStore } from '../contexts/store.context';
const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { customers, loading, error, fetchCustomersByStoreId } = useCustomers();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      fetchCustomersByStoreId(activeStoreId);
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

  const customersWithTags = useMemo(
    () => (customers ?? []).filter((c) => Array.isArray(c.tagIds) && (c.tagIds as any[]).length > 0),
    [customers]
  );

  const handleAddCustomer = useCallback(() => navigate('/customers/new'), [navigate]);
  const handleCustomerClick = useCallback(
    (id: string) => navigate(`/customers/${id}`),
    [navigate]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage customer details, order history, and segments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Import customers
              </button>
              <button
                type="button"
                onClick={handleAddCustomer}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlusIcon className="w-4 h-4" />
                Add customer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total customers</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {customers?.length ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tagged</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {customersWithTags.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <span className="text-violet-600 font-semibold text-sm">#</span>
              </div>
            </div>
          </div>
          <Link
            to="/customers/segments"
            className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:border-blue-200 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Segments</p>
                <p className="mt-1 text-base font-medium text-blue-600 hover:text-blue-700">
                  Manage segments →
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Customers Table Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="mt-4 text-sm text-gray-500">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <p className="text-sm text-red-600">{error}</p>
              {activeStoreId && (
                <button
                  type="button"
                  onClick={() => fetchCustomersByStoreId(activeStoreId)}
                  className="mt-4 text-sm font-medium text-gray-900 hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                {search ? 'No customers match your search' : 'No customers yet'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {search
                  ? 'Try a different search term.'
                  : 'Everything customers-related in one place. Manage details, order history, and segments.'}
              </p>
              {!search && (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddCustomer}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlusIcon className="w-4 h-4" />
                    Add customer
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Import customers
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => handleCustomerClick(c._id)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {c.firstName} {c.lastName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{c.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {c.phoneNumber || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {Array.isArray(c.tagIds) && (c.tagIds as any[]).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(c.tagIds as any[]).map((t: any) => (
                              <span
                                key={t._id || t}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700"
                              >
                                {t.name || t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
