import { Link } from 'react-router-dom';
import { PageShell } from '../shell/PageShell';
import { layout, useThemeColors } from '../tokens';

export function OrdersPage() {
  const { fontHeading, fontBody, text, muted } = useThemeColors();

  return (
    <PageShell>
      <section style={{ padding: `72px ${layout.padX}px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }} className="hz-reveal">
          <p className="hz-eyebrow" style={{ color: muted, margin: '0 0 12px' }}>Account</p>
          <h1 style={{ fontFamily: fontHeading, fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>Orders</h1>
          <p style={{ color: muted, lineHeight: 1.7, marginBottom: 24 }}>Your order history will appear here.</p>
          <Link to="/collections/all" className="hz-btn hz-btn--primary">Continue shopping</Link>
        </div>
      </section>
    </PageShell>
  );
}
