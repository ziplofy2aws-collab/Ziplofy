export type OrderPaymentStatus = 'paid' | 'pending' | 'refunded';
export type OrderFulfillmentStatus = 'unfulfilled' | 'fulfilled';

export type OrderLineItemSummary = {
  lineItemId: string;
  productId?: string;
  title: string;
  imageUrl?: string;
  quantity: number;
  price: number;
};

export type OrderCustomerSummary = {
  customerId?: string;
  name: string;
  email?: string;
  location: string;
  orderCount: number;
};

export type OrderTableRowData = {
  orderId: string;
  displayNumber: string;
  date: string;
  customer: OrderCustomerSummary;
  fulfillBy: string;
  channel: string;
  total: number;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: string;
  fulfillmentStatus: OrderFulfillmentStatus;
  items: number;
  lineItems: OrderLineItemSummary[];
  deliveryStatus: string;
  deliveryMethod: string;
  tags: string;
};
