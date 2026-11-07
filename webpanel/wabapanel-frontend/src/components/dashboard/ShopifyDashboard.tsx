'use client';
import React from 'react';
import Link from 'next/link';
import {
  dashboardCardShell,
  dashboardStatValueClassFor,
} from '@/components/layout/dashboard-ui';
import { showNavBusy } from '@/stores/busyStore';

/** Soft icon tints — same palette as the original dashboard, muted for Shopify cards. */
export type StatColor = 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'amber' | 'indigo' | 'rose';

export const statColorStyles: Record<StatColor, { icon: string; bar: string }> = {
  emerald: { icon: 'bg-[#eef8f0] text-[#0f766e]', bar: 'from-[#6ee7b0] to-[#14b8a6]' },
  blue: { icon: 'bg-[#eef6fb] text-[#2563eb]', bar: 'from-[#93c5fd] to-[#60a5fa]' },
  purple: { icon: 'bg-[#f5f0ff] text-[#7c3aed]', bar: 'from-[#c4b5fd] to-[#a78bfa]' },
  orange: { icon: 'bg-[#fff7ed] text-[#ea580c]', bar: 'from-[#fdba74] to-[#fb923c]' },
  red: { icon: 'bg-[#fef2f2] text-[#dc2626]', bar: 'from-[#fca5a5] to-[#f87171]' },
  amber: { icon: 'bg-[#fffbeb] text-[#d97706]', bar: 'from-[#fcd34d] to-[#fbbf24]' },
  indigo: { icon: 'bg-[#eef2ff] text-[#4f46e5]', bar: 'from-[#a5b4fc] to-[#818cf8]' },
  rose: { icon: 'bg-[#fff1f2] text-[#e11d48]', bar: 'from-[#fda4af] to-[#fb7185]' },
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
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint.icon} [&>svg]:h-4 [&>svg]:w-4`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block" onClick={() => showNavBusy(href)}>
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
            className="shrink-0 text-[13px] font-semibold text-[#0f766e] hover:underline"
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
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint.bar} shadow-sm [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-white`}
          >
            {icon}
          </div>
        )}
        <h2 className="text-[15px] font-semibold text-[#101828]">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#e8efe9] to-transparent" />
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8f5a8]/80 to-[#d4f4d8] px-3 py-1.5 text-[12px] font-medium text-[#0f3d2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-inset ring-[#b7e4c0]/80">
      {connectedLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef2f2] px-3 py-1.5 text-[12px] font-medium text-[#b91c1c] ring-1 ring-inset ring-[#fecaca]">
      {disconnectedLabel}
    </span>
  );
}
