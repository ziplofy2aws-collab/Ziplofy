import { Link } from 'react-router-dom';
import type { StorefrontProductItem } from '../../contexts/product.context';
import { formatINR } from '../../utils/currency';

export function Theme1TrendingNowSection({ featured }: { featured?: StorefrontProductItem }) {
  if (!featured) return null;

  return (
    <section aria-label="Trending now section">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Trending now section</h2>
      <Link
        to={`/products/${featured._id}`}
        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid sm:grid-cols-2"
      >
        <div className="aspect-[16/10] bg-slate-100 sm:aspect-auto sm:min-h-[220px]">
          {featured.imageUrls?.[0] ? (
            <img src={featured.imageUrls[0]} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-slate-400">No image</div>
          )}
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Spotlight</p>
          <p className="mt-2 text-xl font-semibold leading-snug text-slate-900">{featured.title}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{featured.description}</p>
          <p className="mt-4 text-lg font-semibold tabular-nums text-teal-800">{formatINR(featured.price)}</p>
        </div>
      </Link>
    </section>
  );
}
