import { Link } from 'react-router-dom';
import type { StorefrontProductItem } from '../../contexts/product.context';
import { formatINR } from '../../utils/currency';

export function Theme2TrendingNowSection({
  products,
  loading,
}: {
  products: StorefrontProductItem[];
  loading: boolean;
}) {
  return (
    <section className="flex flex-1 flex-col bg-white" aria-label="Trending now section">
      <div className="border-b-4 border-black bg-black px-2 py-2 text-[11px] font-bold uppercase text-[#FFEB00]">
        TRENDING NOW SECTION // SCROLL_X
      </div>
      <div className="min-h-[220px] flex-1 overflow-x-auto overflow-y-hidden">
        {loading && products.length === 0 ? (
          <div className="flex h-full items-center px-4 font-bold uppercase">LOADING…</div>
        ) : (
          <div className="flex h-full w-max gap-0">
            {products.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="flex h-full w-[200px] shrink-0 flex-col border-r-4 border-black bg-[#FFEB00] hover:bg-black hover:text-[#FFEB00]"
              >
                <div className="aspect-square border-b-4 border-black bg-white">
                  {p.imageUrls?.[0] ? (
                    <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover grayscale hover:grayscale-0" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-bold">∅</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-2">
                  <p className="line-clamp-3 text-[11px] font-black uppercase leading-tight">{p.title}</p>
                  <p className="mt-2 border-t-2 border-black pt-2 text-sm font-black tabular-nums">{formatINR(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      {!loading && products.length === 0 ? <div className="border-t-4 border-black p-4 text-sm font-bold uppercase">EMPTY_CATALOG</div> : null}
    </section>
  );
}
