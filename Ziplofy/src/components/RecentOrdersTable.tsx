import { ChevronDownIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import RecentOrderTableItem, { RecentOrder } from './RecentOrderTableItem';

interface RecentOrdersTableProps {
  orders?: RecentOrder[];
  onOrderSelect?: (orderId: string) => void;
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders = [
    {
      orderId: '#878909',
      date: '2026-12-02',
      customer: 'Oliver John Brown',
      category: 'Shoes, Shirt',
      status: 'pending',
      items: 2,
      total: 789.0,
    },
    {
      orderId: '#878910',
      date: '2026-12-01',
      customer: 'Noah James Smith',
      category: 'Sneakers, T-shirt',
      status: 'completed',
      items: 3,
      total: 967.0,
    },
    {
      orderId: '#878911',
      date: '2026-12-03',
      customer: 'Liam Michael Johnson',
      category: 'Jeans, T-shirt',
      status: 'completed',
      items: 4,
      total: 1234.0,
    },
    {
      orderId: '#878912',
      date: '2026-12-04',
      customer: 'William David Williams',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 5,
      total: 1567.0,
    },
    {
      orderId: '#878913',
      date: '2026-12-05',
      customer: 'James Robert Brown',
      category: 'Sweater, T-shirt',
      status: 'completed',
      items: 6,
      total: 1890.0,
    },
    {
      orderId: '#878914',
      date: '2026-12-06',
      customer: 'Benjamin Thomas Jones',
      category: 'T-shirt, T-shirt',
      status: 'completed',
      items: 7,
      total: 2213.0,
    },
    {
      orderId: '#878915',
      date: '2026-12-07',
      customer: 'Lucas William Davis',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 8,
      total: 2546.0,
    },
    {
      orderId: '#878916',
      date: '2026-12-08',
      customer: 'Henry Michael Miller',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 9,
      total: 2879.0,
    },
    {
      orderId: '#878917',
      date: '2026-12-09',
      customer: 'Alexander James Wilson',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 10,
      total: 3212.0,
    },
    {
      orderId: '#878918',
      date: '2026-12-10',
      customer: 'Jackson David Brown',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 11,
      total: 3545.0,
    },
    {
      orderId: '#878919',
      date: '2026-12-11',
      customer: 'Sebastian James Miller',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 12,
      total: 3878.0,
    },
    {
      orderId: '#878920',
      date: '2026-12-12',
      customer: 'Aiden David Wilson',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 13,
      total: 4211.0,
    },
    {
      orderId: '#878921',
      date: '2026-12-13',
      customer: 'Oliver John Brown',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 14,
      total: 4534.0,
    },
    {
      orderId: '#878922',
      date: '2026-12-14',
      customer: 'Noah James Smith',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 15,
      total: 4857.0,
    },
    {
      orderId: '#878923',
      date: '2026-12-15',
      customer: 'Liam Michael Johnson',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 16,
      total: 5180.0,
    },
    {
      orderId: '#878924',
      date: '2026-12-16',
      customer: 'William David Williams',
      category: 'Jacket, T-shirt',
      status: 'completed',
      items: 17,
      total: 5503.0,
    },
  ],
  onOrderSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Sort by');

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = ['Sort by', 'Date', 'Customer', 'Status', 'Total'];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSortSelect = useCallback(
    (option: string) => {
      setSortBy(option);
      setIsSortDropdownOpen(false);
    },
    []
  );

  const handleOrderSelect = useCallback(
    (orderId: string) => {
      setSelectedOrderId(orderId);
      if (onOrderSelect) {
        onOrderSelect(orderId);
      }
    },
    [onOrderSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.category.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent orders</h3>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Bars3Icon className="w-5 h-5 text-gray-500" />
              <span>{sortBy}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortSelect(option)}
                    className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                      sortBy === option ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-scroll h-[500px]">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <input
                  type="radio"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order Id
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <RecentOrderTableItem
                  key={`${order.orderId}-${index}`}
                  order={order}
                  isSelected={selectedOrderId === order.orderId}
                  onSelect={handleOrderSelect}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;

