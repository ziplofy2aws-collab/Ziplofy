import { useState } from 'react';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { useStorefrontProducts } from '../../contexts/product.context';
import { useStorefrontCollections } from '../../contexts/storefront-collections.context';
import { Theme1CartDrawer } from './Theme1CartDrawer';
import { Theme1Header } from './Theme1Header';
import { Theme1HeroSection } from './Theme1HeroSection';
import { Theme1CategorySection } from './Theme1CategorySection';
import { Theme1TrendingNowSection } from './Theme1TrendingNowSection';
import { Theme1NewArrivalsSection } from './Theme1NewArrivalsSection';
import { Theme1BannerSection } from './Theme1BannerSection';
import { Theme1Footer } from './Theme1Footer';

/**
 * Theme1 — magazine layout: gradient hero, numbered collections rail, bento product grid.
 * Same render-store hooks as other React packs; UI only.
 */
export function Theme1Home() {
  const { storeFrontMeta } = useStorefront();
  const { user, logout } = useStorefrontAuth();
  const { products, loading: productsLoading } = useStorefrontProducts();
  const { collections, loading: collectionsLoading } = useStorefrontCollections();
  const [cartOpen, setCartOpen] = useState(false);

  const name = storeFrontMeta?.name ?? 'Store';
  const featured = products[0];
  const rest = products.slice(1);

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <Theme1Header
        storeName={name}
        userName={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
        onCartOpen={() => setCartOpen(true)}
        onLogout={() => {
          logout().catch(() => {});
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Theme1HeroSection storeName={name} description={storeFrontMeta?.description} />

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Theme1CategorySection collections={collections} loading={collectionsLoading} />
          <section className="space-y-8 lg:col-span-8" aria-label="Products">
            <Theme1TrendingNowSection featured={featured} />
            <Theme1NewArrivalsSection products={rest} loading={productsLoading} />
          </section>
        </div>
        <Theme1BannerSection />
      </main>

      <Theme1Footer storeName={name} />

      <Theme1CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
