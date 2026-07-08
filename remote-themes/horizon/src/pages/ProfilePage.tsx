import { Link } from 'react-router-dom';
import { useStorefrontAuth } from '@render-store/sdk';
import { PageShell } from '../shell/PageShell';
import { layout, useThemeColors } from '../tokens';

export function ProfilePage() {
  const { user } = useStorefrontAuth();
  const { fontHeading, fontBody, text, muted } = useThemeColors();

  return (
    <PageShell>
      <section style={{ padding: `72px ${layout.padX}px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }} className="hz-reveal">
          <p className="hz-eyebrow" style={{ color: muted, margin: '0 0 12px' }}>Account</p>
          <h1 style={{ fontFamily: fontHeading, fontSize: '2.5rem', fontWeight: 400, margin: '0 0 24px' }}>
            {user?.name?.trim() || user?.email || 'Your profile'}
          </h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/my-orders" className="hz-btn hz-btn--primary">Orders</Link>
            <Link to="/preferences" className="hz-btn hz-btn--ghost">Preferences</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
