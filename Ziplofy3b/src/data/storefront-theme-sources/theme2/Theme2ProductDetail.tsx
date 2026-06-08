import { Link } from 'react-router-dom';
import type { ReactProductDetailViewModel } from '../shared/useReactProductDetail';
import { formatINR } from '../../utils/currency';
import { Theme2Header } from './Theme2Header';
import { Theme2Footer } from './Theme2Footer';

export function Theme2ProductDetail({ detail: d }: { detail: ReactProductDetailViewModel }) {
  const name = (d.storeFrontMeta?.name ?? 'STORE').toUpperCase();

  if (d.productDetailLoading && !d.product) {
    return (
      <div className="min-h-svh bg-[#FFEB00] font-mono text-black">
        <div className="border-b-4 border-black bg-black px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FFEB00]">LOADING_PRODUCT</div>
        <div className="flex justify-center py-24 text-sm font-bold uppercase">…</div>
      </div>
    );
  }

  if ((d.productDetailError && !d.product) || !d.product) {
    return (
      <div className="min-h-svh bg-[#FFEB00] font-mono text-black">
        <div className="border-b-4 border-black bg-black px-2 py-2 text-[10px] font-bold text-[#FFEB00]">ERR</div>
        <div className="border-b-4 border-black p-6">
          <p className="text-sm font-black uppercase">{d.productDetailError || 'NOT_FOUND'}</p>
          <Link to="/products" className="mt-4 inline-block border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase hover:bg-black hover:text-[#FFEB00]">
            ← CATALOG
          </Link>
        </div>
      </div>
    );
  }

  const product = d.product;
  const images = d.images.length > 0 ? d.images : ['https://via.placeholder.com/800x600?text=Product'];

  return (
    <div className="min-h-svh bg-[#FFEB00] font-mono text-black selection:bg-black selection:text-[#FFEB00]">
      <div className="border-b-4 border-black bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFEB00]">
        PDP // {name}
      </div>

      <Theme2Header
        userName={d.user ? `${d.user.firstName} ${d.user.lastName}`.trim() : undefined}
        onCartOpen={() => window.dispatchEvent(new Event('open-cart-drawer'))}
        onLogout={() => {
          d.logout().catch(() => {});
        }}
      />

      <main className="mx-auto max-w-6xl px-2 py-6 sm:px-4">
        <div className="border-4 border-black bg-white px-3 py-2 text-[10px] font-bold uppercase">
          <Link to="/products" className="underline hover:no-underline">PRODUCTS</Link>
          <span className="mx-2">::</span>
          <span className="wrap-break-word">{product.title}</span>
        </div>

        <div className="mt-6 grid gap-0 border-4 border-black bg-white lg:grid-cols-2">
          <div className="border-b-4 border-black lg:border-b-0 lg:border-r-4">
            <img
              src={images[d.currentImageIndex]}
              alt={product.title}
              className="aspect-square w-full object-cover grayscale hover:grayscale-0"
            />
            {images.length > 1 ? (
              <div className="flex flex-wrap gap-0 border-t-4 border-black">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => d.setCurrentImageIndex(index)}
                    className={`h-16 w-16 shrink-0 border-r-4 border-b-4 border-black ${
                      d.currentImageIndex === index ? 'bg-black' : 'bg-[#FFEB00]'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col border-black p-4 sm:p-6">
            <h1 className="text-2xl font-black uppercase leading-tight sm:text-3xl wrap-break-word">{product.title}</h1>
            <p className="mt-4 border-l-4 border-black pl-3 text-2xl font-black tabular-nums">{formatINR(product.price)}</p>

            {!d.variantsLoading && !(d.variants.length === 1 && d.variants[0]?.isSynthetic) && d.optionAxes.length > 0 ? (
              <div className="mt-6 space-y-4 border-t-4 border-black pt-6">
                {d.optionAxes.map((axis) => (
                  <div key={axis.name}>
                    <p className="text-[10px] font-bold uppercase opacity-70">{axis.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {axis.values.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => d.handleSelectOption(axis.name, val)}
                          className={`border-2 border-black px-3 py-1.5 text-xs font-bold uppercase ${
                            d.selectedOptions[axis.name] === val ? 'bg-black text-[#FFEB00]' : 'bg-white hover:bg-[#FFEB00]'
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

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={d.handleAddToCart}
                className="border-4 border-black bg-white py-4 text-sm font-black uppercase hover:bg-black hover:text-[#FFEB00]"
              >
                ADD_TO_CART
              </button>
              <button
                type="button"
                onClick={d.handleBuyNow}
                className="border-4 border-black bg-black py-4 text-sm font-black uppercase text-[#FFEB00] hover:bg-[#FFEB00] hover:text-black"
              >
                BUY_NOW
              </button>
            </div>

            <div className="mt-8 border-4 border-black bg-black p-4 text-[11px] font-bold uppercase leading-relaxed text-[#FFEB00]">
              {[
                { key: 'description' as const, label: 'DESC' },
                { key: 'specification' as const, label: 'SPEC' },
                { key: 'information' as const, label: 'INFO' },
              ].map((section) => {
                const isOpen = d.openAccordion === section.key;
                return (
                  <div key={section.key} className="border-b-2 border-[#FFEB00] last:border-0">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-left"
                      onClick={() => d.setOpenAccordion((prev) => (prev === section.key ? null : section.key))}
                    >
                      {section.label}
                      <span>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen ? (
                      <div className="border-t-2 border-[#FFEB00] pb-3 pt-2 font-mono text-[10px] normal-case leading-snug">
                        {section.key === 'description' ? (
                          <p>{product.description || 'N/A'}</p>
                        ) : section.key === 'specification' ? (
                          <ul className="space-y-1">
                            <li>VENDOR: {product.vendor?.name || '—'}</li>
                            <li>CAT: {product.category?.name || '—'}</li>
                          </ul>
                        ) : (
                          <p>STORE POLICY APPLIES.</p>
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
          <section className="mt-10 border-4 border-black bg-black p-3 text-[#FFEB00]">
            <h2 className="text-[10px] font-bold uppercase tracking-widest">RELATED // STRIP</h2>
            <div className="mt-4 flex gap-0 overflow-x-auto pb-2">
              {d.relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/products/${rel._id}`}
                  className="flex w-[160px] shrink-0 flex-col border-4 border-[#FFEB00] bg-[#FFEB00] text-black hover:bg-white"
                >
                  <div className="aspect-square border-b-4 border-black bg-white">
                    {rel.imageUrls?.[0] ? (
                      <img src={rel.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs">∅</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-2 text-[10px] font-black uppercase leading-tight">{rel.title}</p>
                    <p className="mt-2 text-xs font-black tabular-nums">{formatINR(rel.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Theme2Footer />
    </div>
  );
}
