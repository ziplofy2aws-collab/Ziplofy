import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import CodiicLogo from './CodiicLogo';

const FEATURES = [
  {
    title: 'Faster Development',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M13 2 4.5 13.5H12l-1 8.5L19.5 10.5H12L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Enterprise Security',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M12 3 5 6.5v5.2c0 4.2 2.9 7.9 7 9.3 4.1-1.4 7-5.1 7-9.3V6.5L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 12.2 11.2 14l3.5-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Scalable Infrastructure',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="10" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="16" width="16" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export default function AuthSplit({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const { pathname } = useLocation();
  const mode = pathname.includes('register') ? 'register' : 'login';
  const cardRef = useRef<HTMLDivElement>(null);
  const prevHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia('(max-width: 720px)').matches) {
      prevHeight.current = null;
      el.style.height = '';
      el.style.transition = '';
      return;
    }
    const next = el.getBoundingClientRect().height;
    const prev = prevHeight.current;
    prevHeight.current = next;
    if (prev == null || Math.abs(prev - next) < 2) return;
    el.style.height = `${prev}px`;
    el.style.transition = 'none';
    void el.offsetHeight;
    el.style.transition = 'height 480ms cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.height = `${next}px`;
    const done = () => {
      el.style.height = '';
      el.style.transition = '';
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done);
    return () => el.removeEventListener('transitionend', done);
  }, [pathname]);

  return (
    <div className={`auth-page auth-page--${mode}`}>
      <div ref={cardRef} className={`auth-card auth-card--${mode}`}>
        <aside className="auth-brand">
          <div className="auth-brand__art">
            <img src="/login-hero.png" alt="" className="auth-brand__hero" decoding="async" />
          </div>
          <div className="auth-brand__copyblock">
            <h1 className="auth-brand__headline">
              Build, Manage &amp; Scale with <span>CODIIC</span>
            </h1>
            <p className="auth-brand__copy">
              Your all-in-one platform for building, deploying and managing digital products securely.
            </p>
          </div>
          <ul className="auth-features">
            {FEATURES.map((f) => (
              <li key={f.title} className="auth-feature">
                <span className="auth-feature__icon">{f.icon}</span>
                <span className="auth-feature__label">{f.title}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section key={pathname} className={`auth-panel auth-panel--${mode} auth-panel--enter`}>
          <CodiicLogo className="auth-panel__logo" />
          <h2 className="auth-panel__title">{title}</h2>
          <p className="auth-panel__sub">{subtitle}</p>
          <div className="auth-panel__body">{children}</div>
        </section>
      </div>
    </div>
  );
}
