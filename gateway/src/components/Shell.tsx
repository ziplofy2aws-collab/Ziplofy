import type { ReactNode } from 'react';

export default function Shell({
  children,
  wide,
  title,
  subtitle,
  step,
  totalSteps = 3,
}: {
  children: ReactNode;
  wide?: boolean;
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
}) {
  return (
    <div className="shell">
      <div className={wide ? 'card wide' : 'card'}>
        <div className="brand">
          <span />
          CODIIC
        </div>
        {typeof step === 'number' ? (
          <div className="steps" aria-hidden="true">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div key={n} className={n <= step ? 'dot on' : 'dot'} />
            ))}
          </div>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p className="sub">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}
