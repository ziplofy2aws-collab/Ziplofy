import React from 'react';

export interface RecentOrder {
  orderId: string;
  date: string;
  customer: string;
  category: string;
  status: 'pending' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  total: number;
}

interface RecentOrderTableItemProps {
  order: RecentOrder;
  isSelected?: boolean;
  onSelect?: (orderId: string) => void;
}

const RecentOrderTableItem: React.FC<RecentOrderTableItemProps> = ({
  order,
  isSelected = false,
  onSelect,
}) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-pink-100 text-pink-700';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <input
          type="radio"
          checked={isSelected}
          onChange={() => onSelect?.(order.orderId)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-gray-900">{order.orderId}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-600">{formatDate(order.date)}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-900">{order.customer}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-600">{order.category}</span>
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(
            order.status
          )}`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-600">
          {order.items}{order.items === 1 ? 'Item' : 'Items'}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</span>
      </td>
    </tr>
  );
};

export default RecentOrderTableItem;

