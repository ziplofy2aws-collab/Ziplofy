'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Package, Truck } from 'lucide-react';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { orderApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

interface OrderItem { name: string; price: number; quantity: number; currency?: string; }
interface ShippingAddress { name?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string; country?: string; }
interface Order {
  _id: string;
  orderNumber: string;
  contact?: { name?: string; phone?: string };
  items: OrderItem[];
  totalAmount: number;
  currency?: string;
  status: string;
  paymentStatus: string;
  source?: string;
  shippingAddress?: ShippingAddress;
  notes?: string;
  createdAt: string;
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

const money = (p?: number, cur?: string) => {
  const v = p || 0;
  const sym = cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : cur === 'INR' ? '₹' : '';
  return sym ? `${sym}${v.toLocaleString()}` : `${cur || ''} ${v.toLocaleString()}`.trim();
};

export default function OrdersPage() {
  const { currentWorkspace } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState('all');
  const [editStatus, setEditStatus] = useState('');
  const [editPayment, setEditPayment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    if (!currentWorkspace) return;
    setLoading(true);
    orderApi.getOrders().then(r => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrders(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [currentWorkspace]);

  const openOrder = (o: Order) => { setSelected(o); setEditStatus(o.status); setEditPayment(o.paymentStatus); };

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await orderApi.updateOrder(selected._id, { status: editStatus, paymentStatus: editPayment });
      setOrders(prev => prev.map(o => o._id === selected._id ? { ...o, status: editStatus, paymentStatus: editPayment } : o));
      setSelected(null);
    } catch { /* keep modal open on failure */ }
    setSaving(false);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusColor = (s: string) => ({ pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'danger' }[s] || 'default') as 'warning' | 'info' | 'success' | 'danger' | 'default';

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0),
  };
  const revenueCur = orders.find(o => o.currency)?.currency || 'INR';

  const columns = [
    { key: 'orderNumber', title: 'Order', render: (o: Order) => <span className="text-[13px] font-medium text-admin-text">#{o.orderNumber}</span> },
    { key: 'contact', title: 'Customer', render: (o: Order) => <div><p className="text-[13px] font-medium text-admin-text">{o.contact?.name || o.shippingAddress?.name || 'N/A'}</p><p className="text-[12px] text-admin-text-subdued">{o.contact?.phone || o.shippingAddress?.phone}</p></div> },
    { key: 'items', title: 'Items', render: (o: Order) => <span className="text-[13px] text-admin-text">{o.items?.reduce((n, i) => n + (i.quantity || 1), 0) || 0}</span> },
    { key: 'total', title: 'Total', render: (o: Order) => <span className="text-[13px] font-semibold text-admin-text">{money(o.totalAmount, o.currency)}</span> },
    { key: 'status', title: 'Status', render: (o: Order) => <Badge variant={statusColor(o.status)}>{o.status}</Badge> },
    { key: 'payment', title: 'Payment', render: (o: Order) => <Badge variant={o.paymentStatus === 'paid' ? 'success' : o.paymentStatus === 'refunded' ? 'danger' : 'warning'}>{o.paymentStatus}</Badge> },
    { key: 'date', title: 'Date', render: (o: Order) => <span className="text-[13px] text-admin-text-secondary">{new Date(o.createdAt).toLocaleString()}</span> },
    { key: 'actions', title: '', render: (o: Order) => <button type="button" onClick={() => openOrder(o)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><Eye className="h-4 w-4" /></button> },
  ];

  const addr = selected?.shippingAddress;
  const hasAddr = addr && (addr.address || addr.city || addr.pincode);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Orders</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Track and update customer orders and payment status
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Orders', value: String(stats.total), icon: <ShoppingCart className="h-4 w-4 text-blue-700" />, tint: 'bg-blue-50' },
          { label: 'Pending', value: String(stats.pending), icon: <Package className="h-4 w-4 text-amber-700" />, tint: 'bg-amber-50' },
          { label: 'Delivered', value: String(stats.delivered), icon: <Truck className="h-4 w-4 text-emerald-700" />, tint: 'bg-emerald-50' },
          { label: 'Paid Revenue', value: money(stats.revenue, revenueCur), icon: <ShoppingCart className="h-4 w-4 text-emerald-700" />, tint: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${dashboardCardShell} !p-3.5`}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.tint}`}>{stat.icon}</span>
              <span className="text-[12px] font-medium text-admin-text-secondary">{stat.label}</span>
            </div>
            <p className="text-xl font-bold tabular-nums leading-tight text-admin-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
              filter === s
                ? 'border-admin-text bg-admin-text text-white'
                : 'border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        onBulkDelete={async (ids) => {
          await Promise.all(ids.map((id) => orderApi.deleteOrder(id).catch(() => null)));
          fetchOrders();
        }}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?.orderNumber || ''}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div><span className="text-admin-text-secondary">Customer:</span> <span className="font-medium text-admin-text">{selected.contact?.name || selected.shippingAddress?.name || 'N/A'}</span></div>
              <div><span className="text-admin-text-secondary">Phone:</span> <span className="font-medium text-admin-text">{selected.contact?.phone || selected.shippingAddress?.phone || '-'}</span></div>
              <div><span className="text-admin-text-secondary">Placed:</span> <span className="font-medium text-admin-text">{new Date(selected.createdAt).toLocaleString()}</span></div>
              <div><span className="text-admin-text-secondary">Source:</span> <span className="font-medium capitalize text-admin-text">{selected.source || 'manual'}</span></div>
            </div>

            {hasAddr && (
              <div className="text-[13px]">
                <h4 className="mb-1 font-medium text-admin-text">Shipping address</h4>
                <p className="text-admin-text-secondary">
                  {[addr?.address, addr?.city, addr?.state, addr?.pincode, addr?.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <div>
              <h4 className="mb-2 font-medium text-admin-text">Items</h4>
              <div className="divide-y divide-admin-divider rounded-lg border border-admin-border bg-[#f6f6f7]">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between p-3 text-[13px]">
                    <span className="text-admin-text">{item.name} <span className="text-admin-text-subdued">× {item.quantity}</span></span>
                    <span className="font-medium text-admin-text">{money((item.price || 0) * (item.quantity || 1), item.currency || selected.currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 text-[13px] font-semibold text-admin-text"><span>Total</span><span>{money(selected.totalAmount, selected.currency)}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-admin-border pt-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[12px] text-admin-text-secondary">Order status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] capitalize text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-admin-text-secondary">Payment status</label>
                <select value={editPayment} onChange={e => setEditPayment(e.target.value)} className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] capitalize text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30">
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-admin-text-subdued">Status badalne par customer ko WhatsApp update jaata hai (agar order notifications ON hain).</p>

            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryBtn} onClick={() => setSelected(null)}>Close</button>
              <button
                type="button"
                className={primaryBtn}
                onClick={save}
                disabled={saving || (editStatus === selected.status && editPayment === selected.paymentStatus)}
              >
                {saving ? 'Saving...' : 'Update order'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
