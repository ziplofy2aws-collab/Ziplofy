import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { useStorefrontOrder } from '../../contexts/storefront-order.context';
import { formatINR } from '../../utils/currency';
import { Theme2Header } from './Theme2Header';
import { Theme2Footer } from './Theme2Footer';

export function Theme2OrdersPage() {
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
    <div className="min-h-svh bg-[#FFEB00] font-mono text-black">
      <div className="border-b-4 border-black bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFEB00]">
        ORDERS // {(storeFrontMeta?.name ?? 'STORE').toUpperCase()}
      </div>
      <Theme2Header
        userName={`${user.firstName} ${user.lastName}`.trim()}
        onCartOpen={() => {}}
        onLogout={() => {
          logout().catch(() => {});
          navigate('/');
        }}
      />
      <main className="mx-auto max-w-5xl px-3 py-8">
        <h1 className="mb-4 text-xl font-black uppercase">My Orders</h1>
        {loading && orders.length === 0 ? (
          <p className="text-sm font-bold uppercase">LOADING…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm font-bold uppercase">NO_ORDERS</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="border-4 border-black bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-bold">{new Date(o.createdAt).toLocaleString()}</p>
                  <p className="border-2 border-black px-2 py-1 text-[10px] font-black uppercase">{o.status}</p>
                </div>
                <p className="mt-2 text-xs font-black uppercase">ORDER #{o._id.slice(-8).toUpperCase()}</p>
                <p className="mt-1 text-sm font-black">{formatINR(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Theme2Footer />
    </div>
  );
}
