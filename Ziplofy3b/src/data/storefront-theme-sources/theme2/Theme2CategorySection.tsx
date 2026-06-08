import { Link } from 'react-router-dom';
import type { StorefrontCollection } from '../../contexts/storefront-collections.context';

export function Theme2CategorySection({
  collections,
  loading,
}: {
  collections: StorefrontCollection[];
  loading: boolean;
}) {
  return (
    <aside className="flex flex-col border-black bg-black text-[#FFEB00] md:min-h-0" aria-label="Category section">
      <div className="border-b-4 border-[#FFEB00] p-3 text-[10px] font-bold uppercase tracking-widest">CATEGORY SECTION</div>
      <div className="flex-1 overflow-y-auto">
        {loading && collections.length === 0 ? (
          <div className="p-4 text-xs font-bold uppercase">…</div>
        ) : (
          <ul className="m-0 list-none p-0">
            {collections.map((c, i) => (
              <li key={c._id} className="border-b-4 border-[#FFEB00]">
                <Link to={`/collections/${c.urlHandle}`} className="block p-4 transition hover:bg-[#FFEB00] hover:text-black">
                  <span className="block text-[10px] font-bold opacity-70">#{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-1 block text-lg font-black uppercase leading-none">{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!loading && collections.length === 0 ? <div className="p-4 text-xs font-bold uppercase opacity-60">NO_COLLECTIONS</div> : null}
      </div>
    </aside>
  );
}
