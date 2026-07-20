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

export function Theme2CartDrawer({
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
      <button type="button" className="min-h-0 flex-1 cursor-default bg-black/70" onClick={onClose} aria-label="Close cart overlay" />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l-4 border-black bg-[#FFEB00] text-black shadow-2xl">
        <div className="flex items-center justify-between border-b-4 border-black bg-black px-4 py-3 text-[#FFEB00]">
          <h2 className="text-sm font-bold uppercase tracking-wide">Cart buffer</h2>
          <button
            type="button"
            className="rounded-none border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase text-black hover:bg-black hover:text-[#FFEB00]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm font-bold uppercase opacity-80">Cart is empty.</p>
          ) : (
            list.map((row: StorefrontCartItem | GuestCartItem) => {
              const v = row.productVariantId;
              const price = variantPrice(v);
              const thumb = variantThumb(v);
              return (
                <div key={row._id} className="flex gap-3 border-b-4 border-black bg-[#FFEB00] px-4 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden border-2 border-black bg-white">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] opacity-50">No img</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black uppercase">{variantLabel(v)}</p>
                    {price != null && <p className="mt-0.5 text-xs tabular-nums font-bold">{formatINR(price)}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-none border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase hover:bg-black hover:text-[#FFEB00]"
                        disabled={loading}
                        onClick={() => updateCartEntry({ id: row._id, quantity: Math.max(1, row.quantity - 1) }).catch(() => {})}
                      >
                        −
                      </button>
                      <span className="text-xs tabular-nums font-bold">{row.quantity}</span>
                      <button
                        type="button"
                        className="rounded-none border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase hover:bg-black hover:text-[#FFEB00]"
                        disabled={loading}
                        onClick={() => updateCartEntry({ id: row._id, quantity: row.quantity + 1 }).catch(() => {})}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="rounded-none border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase hover:bg-black hover:text-[#FFEB00]"
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
