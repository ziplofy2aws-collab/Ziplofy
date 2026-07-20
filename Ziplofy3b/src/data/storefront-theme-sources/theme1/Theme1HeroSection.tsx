import { Link } from 'react-router-dom';

export function Theme1HeroSection({
  storeName,
  description,
}: {
  storeName: string;
  description?: string;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-14"
      aria-label="Store hero"
    >
      <div className="relative z-10 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100/90">Theme pack · theme1</p>
        <h1 className="mt-2 font-serif text-4xl font-light leading-tight tracking-tight sm:text-5xl">{storeName}</h1>
        {description ? <p className="mt-4 text-sm leading-relaxed text-teal-50/95">{description}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/products" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 shadow hover:bg-teal-50">
            Shop products
          </Link>
          <Link to="/collection" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
            Browse collections
          </Link>
        </div>
      </div>
    </section>
  );
}
