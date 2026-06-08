import { useState } from 'react';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { useStorefrontProducts } from '../../contexts/product.context';
import { useStorefrontCollections } from '../../contexts/storefront-collections.context';
import { Theme2CartDrawer } from './Theme2CartDrawer';
import { Theme2Header } from './Theme2Header';
import { Theme2HeroSection } from './Theme2HeroSection';
import { Theme2CategorySection } from './Theme2CategorySection';
import { Theme2TrendingNowSection } from './Theme2TrendingNowSection';
import { Theme2NewArrivalsSection } from './Theme2NewArrivalsSection';
import { Theme2BannerSection } from './Theme2BannerSection';
import { Theme2Footer } from './Theme2Footer';

/**
 * Theme2 — brutalist / constructivist: harsh black×yellow, mono type, zero radius,
 * horizontal product “tape”, full-width collection slabs. Same hooks as theme1.
 */
export function Theme2Home() {
  const { storeFrontMeta } = useStorefront();
  const { user, logout } = useStorefrontAuth();
  const { products, loading: productsLoading } = useStorefrontProducts();
  const { collections, loading: collectionsLoading } = useStorefrontCollections();
  const [cartOpen, setCartOpen] = useState(false);

  const name = (storeFrontMeta?.name ?? 'STORE').toUpperCase();

  return (
    <div className="min-h-svh bg-[#FFEB00] font-mono text-black selection:bg-black selection:text-[#FFEB00]">
      {/* Top strip — raw utility bar */}
      <div className="border-b-4 border-black bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFEB00]">
        <span className="inline-block w-[8ch]">SYS_OK</span>
        <span className="opacity-80"> :: </span>
        <span>THEME2_BRUTAL // SAME_RUNTIME</span>
      </div>

      <div className="grid min-h-[calc(100svh-2.25rem)] grid-cols-1 md:grid-cols-[1fr_280px]">
        {/* Main chaos column */}
        <div className="flex flex-col border-b-4 border-black md:border-b-0 md:border-r-4">
          <Theme2HeroSection storeName={name} description={storeFrontMeta?.description} />
          <Theme2Header
            userName={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
            onCartOpen={() => setCartOpen(true)}
            onLogout={() => {
              logout().catch(() => {});
            }}
          />
          <Theme2TrendingNowSection products={products} loading={productsLoading} />
          <Theme2NewArrivalsSection products={products.slice(0, 8)} />
          <Theme2BannerSection />
        </div>

        <Theme2CategorySection collections={collections} loading={collectionsLoading} />
      </div>
      <Theme2Footer />

      <Theme2CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
