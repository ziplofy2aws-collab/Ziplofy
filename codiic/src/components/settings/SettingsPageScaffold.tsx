import React from 'react';
import { adminListCardClass } from '../admin-list-ui';
import { adminContentColumnClass } from '../layout/admin-page-width';

/** Standard max width + vertical rhythm for content inside Settings layout `<Outlet />`. */
export const SETTINGS_PAGE_CONTAINER_CLASS = `${adminContentColumnClass} flex flex-col gap-6`;

type SettingsCalloutProps = {
  variant?: 'info' | 'warning' | 'neutral';
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const calloutStyles: Record<NonNullable<SettingsCalloutProps['variant']>, string> = {
  info: 'border-admin-border bg-admin-secondary text-admin-text',
  warning: 'border-amber-200/80 bg-amber-50/80 text-admin-text',
  neutral: 'border-admin-border bg-admin-fill/40 text-admin-text',
};

/** Inline notice — matches billing / tax hint styling */
export function SettingsCallout({
  variant = 'info',
  title,
  icon,
  children,
  className = '',
}: SettingsCalloutProps) {
  const surface = calloutStyles[variant];
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${surface} ${className}`.trim()}
      role="note"
    >
      {icon ? <div className="mt-0.5 shrink-0 text-current opacity-90">{icon}</div> : null}
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-admin-text-secondary">
        {title ? <h3 className="mb-1 text-[13px] font-semibold text-admin-text">{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}

type SettingsHeroProps = {
  title: React.ReactNode;
  description?: string;
  /** Short tip shown below the title row on sm+ */
  tip?: string | React.ReactNode;
  /** Renders above the title row (e.g. back control) */
  leading?: React.ReactNode;
  actions?: React.ReactNode;
};

/**
 * Hero header for settings sub-pages — matches Theme library / Online store preference style.
 */
export function SettingsHero({ title, description, tip, leading, actions }: SettingsHeroProps) {
  return (
    <header className={`${adminListCardClass} px-5 py-5 sm:px-6`}>
      {leading ? <div className="mb-4">{leading}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-admin-text sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-[13px] text-admin-text-secondary">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {tip ? (
        <div className="mt-4 hidden rounded-lg border border-admin-border bg-admin-secondary px-4 py-2.5 sm:block">
          <div className="text-[12px] leading-relaxed text-admin-text-secondary">{tip}</div>
        </div>
      ) : null}
    </header>
  );
}

type SettingsPanelProps = {
  children: React.ReactNode;
  className?: string;
};

/** White card for grouped settings blocks */
export function SettingsPanel({ children, className = '' }: SettingsPanelProps) {
  return (
    <section className={`${adminListCardClass} ${className}`.trim()}>
      {children}
    </section>
  );
}
