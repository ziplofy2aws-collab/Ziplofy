import React from 'react';

/** Standard max width + vertical rhythm for content inside Settings layout `<Outlet />`. */
export const SETTINGS_PAGE_CONTAINER_CLASS =
  'mx-auto flex w-full max-w-[1200px] flex-col gap-6';

type SettingsCalloutProps = {
  variant?: 'info' | 'warning' | 'neutral';
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const calloutStyles: Record<NonNullable<SettingsCalloutProps['variant']>, string> = {
  info: 'border-blue-200/80 bg-blue-50/80 text-gray-900',
  warning: 'border-amber-200/80 bg-amber-50/80 text-gray-900',
  neutral: 'border-gray-200/80 bg-gray-50/90 text-gray-900',
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
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${surface} ${className}`.trim()}
      role="note"
    >
      {icon ? <div className="mt-0.5 shrink-0 text-current opacity-90">{icon}</div> : null}
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-gray-600">
        {title ? <h3 className="mb-1 text-sm font-semibold text-gray-900">{title}</h3> : null}
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
    <header className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:px-6">
      {leading ? <div className="mb-4">{leading}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 border-l-4 border-blue-500/70 pl-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {tip ? (
        <div className="mt-4 hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 sm:block">
          <div className="text-xs leading-relaxed text-slate-600">{tip}</div>
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
    <section
      className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ${className}`.trim()}
    >
      {children}
    </section>
  );
}
