import type { OrdersFilterTab } from './OrdersPageFilters';
import type { OrderTableRowData } from './orders-table.types';

export function filterOrdersByTab(
  orders: OrderTableRowData[],
  activeTab: OrdersFilterTab
): OrderTableRowData[] {
  return orders.filter((order) => {
    switch (activeTab) {
      case 'Unfulfilled':
        return order.fulfillmentStatus === 'unfulfilled';
      case 'Unpaid':
        return order.paymentStatus === 'pending';
      case 'Open':
        return order.fulfillmentStatus === 'unfulfilled' || order.paymentStatus === 'pending';
      case 'Closed':
        return order.fulfillmentStatus === 'fulfilled' && order.paymentStatus === 'paid';
      default:
        return true;
    }
  });
}
