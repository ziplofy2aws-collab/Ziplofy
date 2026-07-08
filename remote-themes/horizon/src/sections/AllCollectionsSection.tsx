import { Link } from 'react-router-dom';
import { useStorefrontCollections } from '@render-store/sdk';
import { collectionPath, STOREFRONT_PATHS } from '../lib/storefrontPaths';
import { layout, useThemeColors } from '../tokens';

export function AllCollectionsSection() {
  const { collections, loading } = useStorefrontCollections();
  const { text, muted, fontHeading, fontBody } = useThemeColors();

  const tiles = collections.filter(
    (c) => c.urlHandle?.trim() && c.urlHandle.trim().toLowerCase() !== 'all'
  );

  return (
    <section
      className="hz-collections-index"
      style={{
        padding: `clamp(48px, 8vw, 96px) ${layout.padX}px`,
        fontFamily: fontBody,
        color: text,
      }}
    >
      <div style={{ maxWidth: layout.maxWidth, margin: '0 auto' }}>
        <header className="hz-reveal" style={{ marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          <p
            className="hz-eyebrow"
            style={{ margin: '0 0 12px', color: muted, letterSpacing: '0.22em', fontSize: 11 }}
          >
            Explore
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: fontHeading,
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            Collections
          </h1>
          <p style={{ margin: '16px 0 0', maxWidth: 480, color: muted, lineHeight: 1.7, fontSize: 15 }}>
            Curated edits, thoughtfully grouped. Choose a world to step into.
          </p>
        </header>

        {loading && tiles.length === 0 ? (
          <p style={{ color: muted, fontSize: 14 }}>Loading collections…</p>
        ) : null}

        {!loading && tiles.length === 0 ? (
          <p style={{ color: muted, fontSize: 14 }}>No collections yet.</p>
        ) : null}

        <div
          className="hz-collections-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'clamp(16px, 2.5vw, 28px)',
          }}
        >
          <Link to={STOREFRONT_PATHS.allProducts} className="hz-collection-card hz-reveal">
            <div className="hz-collection-card__media hz-collection-card__media--all" />
            <div className="hz-collection-card__body">
              <span className="hz-collection-card__label">Everything</span>
              <span className="hz-collection-card__title">All products</span>
            </div>
          </Link>

          {tiles.map((col, index) => {
            const handle = col.urlHandle?.trim() ?? '';
            const href = collectionPath(handle);
            const image = col.imageUrl?.trim();
            return (
              <Link
                key={col._id}
                to={href}
                className="hz-collection-card hz-reveal"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <div
                  className="hz-collection-card__media"
                  style={
                    image
                      ? { backgroundImage: `url(${image})` }
                      : { background: `linear-gradient(145deg, var(--hz-surface), var(--hz-surface-2))` }
                  }
                />
                <div className="hz-collection-card__body">
                  <span className="hz-collection-card__label">Collection</span>
                  <span className="hz-collection-card__title">{col.title?.trim() || 'Untitled'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
