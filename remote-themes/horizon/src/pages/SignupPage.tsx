import { Link } from 'react-router-dom';
import { PageShell } from '../shell/PageShell';
import { layout, useThemeColors } from '../tokens';

export function SignupPage() {
  const { fontHeading, fontBody, text, muted } = useThemeColors();
  const title = 'Create account';

  return (
    <PageShell>
      <section style={{ padding: `72px ${layout.padX}px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }} className="hz-reveal">
          <h1 style={{ fontFamily: fontHeading, fontSize: '2.5rem', fontWeight: 400, margin: '0 0 12px' }}>{title}</h1>
          <p style={{ color: muted, marginBottom: 32, lineHeight: 1.7 }}>
            Join us for a seamless checkout and order history.
          </p>
          <Link to="/auth/login" className="hz-btn hz-btn--ghost" style={{ display: 'inline-flex' }}>
            Already have an account?
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
