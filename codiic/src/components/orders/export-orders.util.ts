import type { OrderTableRowData } from './orders-table.types';

export type OrderCsvFormat = 'excel' | 'plain';

const ORDER_EXPORT_HEADERS = [
  'Order',
  'Date',
  'Customer',
  'Fulfill by',
  'Channel',
  'Total',
  'Payment status',
  'Payment method',
  'Fulfillment status',
  'Items',
  'Delivery status',
  'Delivery method',
  'Tags',
  'Order ID',
] as const;

function escapeCsvCell(value: string | number): string {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatPaymentLabel(status: OrderTableRowData['paymentStatus']): string {
  if (status === 'pending') return 'Payment pending';
  if (status === 'refunded') return 'Refunded';
  return 'Paid';
}

function formatFulfillmentLabel(status: OrderTableRowData['fulfillmentStatus']): string {
  return status === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled';
}

function formatDateForExport(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTotalForExport(total: number): string {
  return total.toFixed(2);
}

function buildCsv(headers: readonly string[], rows: string[][]): string {
  const lines = [headers.join(','), ...rows.map((row) => row.map(escapeCsvCell).join(','))];
  return lines.join('\r\n');
}

export function buildOrdersCsv(orders: OrderTableRowData[], format: OrderCsvFormat): string {
  const rows = orders.map((order) => [
    order.displayNumber,
    formatDateForExport(order.date),
    order.customer.name,
    order.fulfillBy === '—' ? '' : order.fulfillBy,
    order.channel,
    formatTotalForExport(order.total),
    formatPaymentLabel(order.paymentStatus),
    order.paymentMethod === '—' ? '' : order.paymentMethod,
    formatFulfillmentLabel(order.fulfillmentStatus),
    String(order.items),
    order.deliveryStatus === '—' ? '' : order.deliveryStatus,
    order.deliveryMethod,
    order.tags === '—' ? '' : order.tags,
    order.orderId,
  ]);

  const csv = buildCsv(ORDER_EXPORT_HEADERS, rows);
  return format === 'excel' ? `\uFEFF${csv}` : csv;
}

export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function filterOrdersByDateRange(
  orders: OrderTableRowData[],
  startDate: string,
  endDate: string
): OrderTableRowData[] {
  if (!startDate && !endDate) return orders;

  const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const end = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;

  return orders.filter((order) => {
    const time = new Date(order.date).getTime();
    if (Number.isNaN(time)) return false;
    return time >= start && time <= end;
  });
}
