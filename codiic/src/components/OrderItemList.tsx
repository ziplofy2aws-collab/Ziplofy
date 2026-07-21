import React from 'react';
import OrderItem, { OrderItemData } from './OrderItem';

interface OrderItemListProps {
  orders: OrderItemData[];
  selectedOrderIds?: Set<string>;
  onOrderSelect?: (orderId: string, checked: boolean) => void;
  onOrderView?: (orderId: string) => void;
}

const OrderItemList: React.FC<OrderItemListProps> = ({
  orders,
  selectedOrderIds,
  onOrderSelect,
  onOrderView,
}) => {
  return (
    <tbody className="bg-white">
      {orders.length > 0 ? (
        orders.map((order) => (
          <OrderItem
            key={order.orderId}
            order={order}
            isSelected={selectedOrderIds?.has(order.orderId)}
            onSelect={onOrderSelect}
            onView={onOrderView}
          />
        ))
      ) : (
        <tr>
          <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">
            No orders found
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default OrderItemList;

