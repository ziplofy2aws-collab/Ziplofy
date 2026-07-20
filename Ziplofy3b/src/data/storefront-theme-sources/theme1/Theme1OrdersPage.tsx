import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { useStorefrontOrder } from '../../contexts/storefront-order.context';
import { formatINR } from '../../utils/currency';
import { Theme1Header } from './Theme1Header';
import { Theme1Footer } from './Theme1Footer';

export function Theme1OrdersPage() {
  const navigate = useNavigate();
  const { storeFrontMeta } = useStorefront();
  const { user, checkAuth, logout } = useStorefrontAuth();
  const { orders, loading, getOrdersByCustomerId } = useStorefrontOrder();

  useEffect(() => {
    checkAuth().catch(() => {});
  }, [checkAuth]);

  useEffect(() => {
    if (!user?._id) return;
    getOrdersByCustomerId(user._id).catch(() => {});
  }, [user?._id, getOrdersByCustomerId]);

  if (!user) return null;

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <Theme1Header
        storeName={storeFrontMeta?.name ?? 'Store'}
        userName={`${user.firstName} ${user.lastName}`.trim()}
        onCartOpen={() => {}}
        onLogout={() => {
          logout().catch(() => {});
          navigate('/');
        }}
      />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-4 text-xl font-semibold">My Orders</h1>
        {loading && orders.length === 0 ? (
          <p className="text-sm text-slate-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                  <p className="text-xs font-semibold uppercase text-teal-700">{o.status}</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="mt-1 text-sm font-bold text-teal-800">{formatINR(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Theme1Footer storeName={storeFrontMeta?.name ?? 'Store'} />
    </div>
  );
}
