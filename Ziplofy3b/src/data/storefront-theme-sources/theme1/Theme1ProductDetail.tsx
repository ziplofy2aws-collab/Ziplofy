import { Link } from 'react-router-dom';
import type { ReactProductDetailViewModel } from '../shared/useReactProductDetail';
import { formatINR } from '../../utils/currency';
import { Theme1Header } from './Theme1Header';
import { Theme1Footer } from './Theme1Footer';

export function Theme1ProductDetail({ detail: d }: { detail: ReactProductDetailViewModel }) {
  const { storeFrontMeta } = d;
  const name = storeFrontMeta?.name ?? 'Store';

  if (d.productDetailLoading && !d.product) {
    return (
      <div className="min-h-svh bg-slate-50">
        <header className="border-b border-slate-200 bg-white/90 px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-teal-700">{name}</span>
        </header>
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if ((d.productDetailError && !d.product) || !d.product) {
    return (
      <div className="min-h-svh bg-slate-50 text-slate-800">
        <header className="border-b border-slate-200 bg-white px-4 py-3">
          <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
            ← Home
          </Link>
        </header>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-lg font-semibold">{d.productDetailError || 'Product not found'}</p>
          <Link to="/products" className="mt-6 inline-block rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const product = d.product;
  const images = d.images.length > 0 ? d.images : ['https://via.placeholder.com/800x600?text=Product'];

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <Theme1Header
        storeName={name}
        userName={d.user ? `${d.user.firstName} ${d.user.lastName}`.trim() : undefined}
        onCartOpen={() => window.dispatchEvent(new Event('open-cart-drawer'))}
        onLogout={() => {
          d.logout().catch(() => {});
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-teal-800">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-teal-800">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{product.title}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
              <img
                src={images[d.currentImageIndex]}
                alt={product.title}
                className="aspect-4/5 w-full object-cover sm:max-h-[520px]"
              />
            </div>
            {images.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => d.setCurrentImageIndex(index)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition ${
                      d.currentImageIndex === index ? 'border-teal-600 ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Theme1 · Product</p>
            <h1 className="mt-2 font-serif text-3xl font-light tracking-tight text-slate-900 sm:text-4xl">{product.title}</h1>
            <p className="mt-4 text-3xl font-semibold tabular-nums text-teal-900">{formatINR(product.price)}</p>
            <p className="mt-1 text-sm text-slate-500">Taxes included where applicable</p>

            {!d.variantsLoading && !(d.variants.length === 1 && d.variants[0]?.isSynthetic) && d.optionAxes.length > 0 ? (
              <div className="mt-8 space-y-5">
                {d.optionAxes.map((axis) => (
                  <div key={axis.name}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{axis.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {axis.values.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => d.handleSelectOption(axis.name, val)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            d.selectedOptions[axis.name] === val
                              ? 'border-teal-700 bg-teal-700 text-white'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-teal-300'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={d.handleAddToCart}
                className="flex-1 rounded-full border-2 border-teal-700 bg-white py-3.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={d.handleBuyNow}
                className="flex-1 rounded-full bg-teal-700 py-3.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Buy now
              </button>
            </div>

            <div className="mt-10 space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {(
                [
                  { key: 'description' as const, label: 'Description' },
                  { key: 'specification' as const, label: 'Specifications' },
                  { key: 'information' as const, label: 'Shipping & returns' },
                ] as const
              ).map((section) => {
                const isOpen = d.openAccordion === section.key;
                return (
                  <div key={section.key} className="border-b border-slate-100 last:border-0 last:pb-0">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-slate-800"
                      onClick={() => d.setOpenAccordion((prev) => (prev === section.key ? null : section.key))}
                    >
                      {section.label}
                      <span className="text-teal-600">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen ? (
                      <div className="pb-3 text-sm leading-relaxed text-slate-600">
                        {section.key === 'description' ? (
                          <p>{product.description || 'No description yet.'}</p>
                        ) : section.key === 'specification' ? (
                          <ul className="space-y-1">
                            <li><span className="font-medium text-slate-800">Brand:</span> {product.vendor?.name || '—'}</li>
                            <li><span className="font-medium text-slate-800">Category:</span> {product.category?.name || '—'}</li>
                          </ul>
                        ) : (
                          <p>Shipping and return details follow your store&apos;s policies.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {d.relatedProducts.length > 0 ? (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="font-serif text-xl font-light text-slate-900">You may also like</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {d.relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/products/${rel._id}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="aspect-square bg-slate-100">
                    {rel.imageUrls?.[0] ? (
                      <img src={rel.imageUrls[0]} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium text-slate-900">{rel.title}</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-teal-800">{formatINR(rel.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Theme1Footer storeName={name} />
    </div>
  );
}
