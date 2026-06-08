import { Link } from 'react-router-dom';
import type { StorefrontCollection } from '../../contexts/storefront-collections.context';

export function Theme1CategorySection({
  collections,
  loading,
}: {
  collections: StorefrontCollection[];
  loading: boolean;
}) {
  return (
    <section className="lg:col-span-4" aria-label="Category section">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Category section</h2>
      {loading && collections.length === 0 ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <ol className="m-0 list-none space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0">
          {collections.map((c, i) => (
            <li key={c._id} className="border-t border-slate-200 first:border-t-0">
              <Link to={`/collections/${c.urlHandle}`} className="flex items-start gap-4 px-4 py-4 transition hover:bg-teal-50/60">
                <span className="font-mono text-lg tabular-nums text-teal-600/80">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block font-semibold text-slate-900">{c.title}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{c.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      {!loading && collections.length === 0 ? <p className="text-sm text-slate-500">No collections yet.</p> : null}
    </section>
  );
}
