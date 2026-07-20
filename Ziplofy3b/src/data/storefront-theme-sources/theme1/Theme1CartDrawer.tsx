import type { StorefrontCartItem, GuestCartItem } from '../../contexts/storefront-cart.context';
import type { StorefrontProductVariant } from '../../contexts/product-variant.context';
import { useStorefrontCart } from '../../contexts/storefront-cart.context';
import { formatINR } from '../../utils/currency';

function variantLabel(v: StorefrontProductVariant | string): string {
  if (typeof v === 'string') return v;
  const opts = v.optionValues && Object.keys(v.optionValues).length
    ? Object.entries(v.optionValues).map(([k, val]) => `${k}: ${val}`).join(' · ')
    : '';
  return [v.sku, opts].filter(Boolean).join(' · ') || 'Variant';
}

function variantThumb(v: StorefrontProductVariant | string): string | undefined {
  if (typeof v === 'string') return undefined;
  return v.images?.[0];
}

function variantPrice(v: StorefrontProductVariant | string): number | undefined {
  if (typeof v === 'string') return undefined;
  return v.price;
}

export function Theme1CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { getAllItems, updateCartEntry, deleteCartEntry, loading } = useStorefrontCart();
  const list = getAllItems();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="min-h-0 flex-1 cursor-default bg-slate-900/45" onClick={onClose} aria-label="Close cart overlay" />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-teal-200 bg-white text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-teal-100 bg-teal-50/90 px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide">Your cart</h2>
          <button
            type="button"
            className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-teal-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm opacity-80">Cart is empty.</p>
          ) : (
            list.map((row: StorefrontCartItem | GuestCartItem) => {
              const v = row.productVariantId;
              const price = variantPrice(v);
              const thumb = variantThumb(v);
              return (
                <div key={row._id} className="flex gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black/5">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] opacity-50">No img</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{variantLabel(v)}</p>
                    {price != null && <p className="mt-0.5 text-xs tabular-nums opacity-80">{formatINR(price)}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-teal-50"
                        disabled={loading}
                        onClick={() => updateCartEntry({ id: row._id, quantity: Math.max(1, row.quantity - 1) }).catch(() => {})}
                      >
                        −
                      </button>
                      <span className="text-xs tabular-nums">{row.quantity}</span>
                      <button
                        type="button"
                        className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-teal-50"
                        disabled={loading}
                        onClick={() => updateCartEntry({ id: row._id, quantity: row.quantity + 1 }).catch(() => {})}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-teal-50"
                        disabled={loading}
                        onClick={() => deleteCartEntry(row._id).catch(() => {})}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
