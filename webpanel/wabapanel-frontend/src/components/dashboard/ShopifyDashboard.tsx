'use client';
import React from 'react';
import Link from 'next/link';
import {
  dashboardCardShell,
  dashboardStatValueClassFor,
} from '@/components/layout/dashboard-ui';

/** Soft icon tints — same palette as the original dashboard, muted for Shopify cards. */
export type StatColor = 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'amber' | 'indigo' | 'rose';

export const statColorStyles: Record<StatColor, { icon: string; bar: string }> = {
  emerald: { icon: 'bg-emerald-50 text-emerald-600', bar: 'from-emerald-400 to-teal-500' },
  blue: { icon: 'bg-blue-50 text-blue-600', bar: 'from-blue-400 to-sky-500' },
  purple: { icon: 'bg-purple-50 text-purple-600', bar: 'from-purple-400 to-fuchsia-500' },
  orange: { icon: 'bg-orange-50 text-orange-600', bar: 'from-orange-400 to-amber-500' },
  red: { icon: 'bg-red-50 text-red-600', bar: 'from-red-400 to-rose-500' },
  amber: { icon: 'bg-amber-50 text-amber-600', bar: 'from-amber-400 to-yellow-500' },
  indigo: { icon: 'bg-indigo-50 text-indigo-600', bar: 'from-indigo-400 to-blue-500' },
  rose: { icon: 'bg-rose-50 text-rose-600', bar: 'from-rose-400 to-red-500' },
};

export function ShopifyStatCard({
  title,
  value,
  icon,
  href,
  subtitle,
  color = 'emerald',
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  subtitle?: string;
  color?: StatColor;
}) {
  const tint = statColorStyles[color];
  const valueClass = dashboardStatValueClassFor(value);
  const inner = (
    <div className={`${dashboardCardShell} h-full ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-admin-text-secondary">{title}</p>
          <p className={`${valueClass} break-words`}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-[12px] text-admin-text-subdued">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint.icon} [&>svg]:h-4 [&>svg]:w-4`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function ShopifyPanel({
  title,
  actionLabel,
  actionHref,
  children,
  className = '',
  accent = 'emerald',
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  children: React.ReactNode;
  className?: string;
  accent?: StatColor;
}) {
  const barTint = statColorStyles[accent].bar;
  return (
    <div className={`${dashboardCardShell} ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${barTint}`} aria-hidden />
          <h3 className="text-[13px] font-semibold text-admin-text truncate">{title}</h3>
        </div>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="text-[13px] font-semibold text-[#005bd3] hover:underline shrink-0"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export function ShopifySection({
  title,
  icon,
  accent = 'emerald',
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: StatColor;
  children: React.ReactNode;
}) {
  const tint = statColorStyles[accent];
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 px-0.5">
        {icon && (
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tint.bar} shadow-sm [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-white`}
          >
            {icon}
          </div>
        )}
        <h2 className="text-[15px] font-semibold text-admin-text">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-admin-border to-transparent" />
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function StatusBadge({
  connected,
  connectedLabel,
  disconnectedLabel,
}: {
  connected: boolean;
  connectedLabel: string;
  disconnectedLabel: string;
}) {
  return connected ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
      {connectedLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[12px] font-medium text-red-700 ring-1 ring-inset ring-red-600/15">
      {disconnectedLabel}
    </span>
  );
}
