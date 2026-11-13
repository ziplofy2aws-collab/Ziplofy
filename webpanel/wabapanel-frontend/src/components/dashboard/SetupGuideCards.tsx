'use client';
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useStoreStore } from '@/stores/storeStore';

/**
 * Setup-guide cards ported from codiic dashboard (DashboardEmptySetupGuide).
 * Tailwind v4 animates transforms through the standalone `translate` / `rotate` /
 * `scale` properties, so these use `transition-all` rather than a property list.
 */
const easeOutExpo = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

const cardShell = [
  'group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-admin-border bg-white/70 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:min-h-[300px] sm:p-6',
  `transition-all duration-500 ${easeOutExpo} will-change-transform`,
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]',
  'hover:-translate-y-2.5 hover:scale-[1.015]',
  'hover:shadow-[0_2px_6px_-2px_rgba(0,0,0,0.08),0_28px_56px_-18px_rgba(0,0,0,0.32)]',
  'focus-within:-translate-y-2.5 focus-within:scale-[1.015]',
  'focus-within:shadow-[0_2px_6px_-2px_rgba(0,0,0,0.08),0_28px_56px_-18px_rgba(0,0,0,0.32)]',
  'motion-reduce:transform-none motion-reduce:transition-none',
].join(' ');

/** Soft light wash that fades in behind the illustration as the card lifts. */
const cardGlowClass = `pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ${easeOutExpo} group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none`;

const cardGlowStyle: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(120% 90% at 50% 115%, rgba(0,91,211,0.10) 0%, rgba(0,91,211,0.03) 45%, transparent 72%)',
};

const ctaClass =
  'inline-flex w-fit items-center justify-center rounded-full border border-admin-border bg-admin-surface px-4 py-2 text-[13px] font-semibold text-admin-text shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-admin-row-hover group-hover:shadow-[0_4px_10px_-4px_rgba(0,0,0,0.2)]';

/** Illustration pieces animate together when the card is hovered or focused. */
const artBase = `transition-all duration-500 ${easeOutExpo} motion-reduce:transform-none motion-reduce:transition-none`;

/** Left-hand prop drifts further left as the card lifts. */
const artSpreadLeft = `${artBase} group-hover:-translate-x-5 group-hover:-translate-y-1 group-hover:rotate-[-8deg] group-hover:scale-105 group-focus-within:-translate-x-5 group-focus-within:-translate-y-1 group-focus-within:rotate-[-8deg] group-focus-within:scale-105`;

/** Right-hand prop drifts further right as the card lifts. */
const artSpreadRight = `${artBase} group-hover:translate-x-5 group-hover:-translate-y-1 group-hover:rotate-[8deg] group-hover:scale-105 group-focus-within:translate-x-5 group-focus-within:-translate-y-1 group-focus-within:rotate-[8deg] group-focus-within:scale-105`;

/** Centre piece rises above the props it sits between. */
const artLiftCenter = `${artBase} group-hover:-translate-y-3 group-hover:scale-110 group-focus-within:-translate-y-3 group-focus-within:scale-110`;

type SetupCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  illustration: React.ReactNode;
  /** When defined, shows a dynamic CONNECTED / NOT CONNECTED badge top-right. */
  connected?: boolean;
  /** Green filled CTA (used for the WhatsApp connect action). */
  greenCta?: boolean;
};

const ctaGreenClass =
  'inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(5,150,105,0.28)] transition hover:brightness-105';

function SetupCard({ title, description, ctaLabel, href, illustration, connected, greenCta }: SetupCardProps) {
  return (
    <div className={cardShell}>
      <div className={cardGlowClass} style={cardGlowStyle} aria-hidden />

      <div className="relative z-[1] min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold tracking-tight text-admin-text sm:text-lg">{title}</h3>
          {typeof connected === 'boolean' ? (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${connected ? 'bg-[#cdfee1] text-[#0d6b38]' : 'bg-red-100 text-red-600'}`}>
              {connected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 max-w-[34ch] text-[13px] leading-5 text-admin-text-secondary">{description}</p>
      </div>

      <div className="relative my-4 flex min-h-[120px] flex-1 items-center justify-center sm:min-h-[140px]">
        {illustration}
      </div>

      <div className="relative z-[1] mt-auto">
        <Link href={href} className={greenCta ? ctaGreenClass : ctaClass}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

/* ---------- Illustrations (same prop-spread composition as codiic) ---------- */

function WhatsAppIllustration() {
  return (
    <div className="relative flex h-[140px] w-full max-w-[280px] items-end justify-center gap-1">
      <div
        className={`absolute inset-x-6 bottom-3 h-14 rounded-[50%] bg-admin-secondary blur-md ${artBase} group-hover:scale-x-125 group-hover:opacity-70 group-focus-within:scale-x-125 group-focus-within:opacity-70`}
        aria-hidden
      />
      {/* Chat bubble — left prop */}
      <div className={`relative z-[1] ${artSpreadLeft}`}>
        <svg viewBox="0 0 80 72" className="h-[72px] w-[80px] drop-shadow-sm" aria-hidden>
          <path
            d="M14 10 h52 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 H36 L22 66 V54 H14 a10 10 0 0 1 -10 -10 V20 a10 10 0 0 1 10 -10 Z"
            fill="#faf8f4"
            stroke="#d8d5cd"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="32" r="3" fill="#c9c4b8" />
          <circle cx="40" cy="32" r="3" fill="#c9c4b8" />
          <circle cx="54" cy="32" r="3" fill="#c9c4b8" />
        </svg>
      </div>
      {/* WhatsApp mark — centre lift */}
      <div
        className={`relative z-[2] mb-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface shadow-md ${artLiftCenter} group-hover:shadow-[0_10px_22px_-10px_rgba(0,0,0,0.35)]`}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-[#1f8a4c]" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
      {/* Automation bolt — right prop */}
      <div className={`relative z-[1] ${artSpreadRight}`}>
        <svg viewBox="0 0 80 72" className="h-[72px] w-[80px] drop-shadow-sm" aria-hidden>
          <rect x="8" y="10" width="64" height="52" rx="10" fill="#eaf3ec" stroke="#b6d3c0" strokeWidth="2" />
          <path d="M44 18 L30 38 h11 L36 54 L50 34 h-11 Z" fill="#1f8a4c" />
        </svg>
      </div>
    </div>
  );
}

function PlansIllustration() {
  return (
    <div className="relative flex h-[140px] w-full max-w-[280px] items-end justify-center gap-1">
      <div
        className={`absolute inset-x-6 bottom-3 h-14 rounded-[50%] bg-admin-secondary blur-md ${artBase} group-hover:scale-x-125 group-hover:opacity-70 group-focus-within:scale-x-125 group-focus-within:opacity-70`}
        aria-hidden
      />
      {/* Free tier card — left prop */}
      <div className={`relative z-[1] ${artSpreadLeft}`}>
        <div className="w-[92px] rounded-xl border border-admin-border bg-admin-surface p-2.5 shadow-sm">
          <div className="h-1.5 w-8 rounded-full bg-admin-fill" />
          <div className="mt-2 text-[15px] font-bold text-admin-text">₹0</div>
          <div className="mt-1 space-y-1">
            <div className="h-1 w-full rounded-full bg-admin-secondary" />
            <div className="h-1 w-4/5 rounded-full bg-admin-secondary" />
          </div>
        </div>
      </div>
      {/* Pro tier card — centre lift */}
      <div className={`relative z-[2] mb-3 ${artLiftCenter}`}>
        <div className="w-[108px] rounded-xl border border-admin-border bg-admin-surface p-3 shadow-md group-hover:shadow-[0_10px_22px_-10px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-10 rounded-full bg-admin-fill" />
            <span className="rounded-full bg-[#cdfee1] px-1.5 py-0.5 text-[8px] font-bold text-[#0d6b38]">PRO</span>
          </div>
          <div className="mt-2 text-[18px] font-bold text-admin-text">₹999</div>
          <div className="mt-1 space-y-1">
            <div className="h-1 w-full rounded-full bg-admin-secondary" />
            <div className="h-1 w-4/5 rounded-full bg-admin-secondary" />
            <div className="h-1 w-3/5 rounded-full bg-admin-secondary" />
          </div>
        </div>
      </div>
      {/* Sparkle tag — right prop */}
      <div className={`relative z-[1] ${artSpreadRight}`}>
        <div className="w-[92px] rounded-xl border border-admin-border bg-admin-surface p-2.5 shadow-sm">
          <div className="h-1.5 w-8 rounded-full bg-admin-fill" />
          <div className="mt-2 text-[15px] font-bold text-admin-text">₹499</div>
          <div className="mt-1 space-y-1">
            <div className="h-1 w-full rounded-full bg-admin-secondary" />
            <div className="h-1 w-2/3 rounded-full bg-admin-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AiIllustration() {
  return (
    <div className="relative flex h-[140px] w-full max-w-[280px] items-end justify-center gap-1">
      <div
        className={`absolute inset-x-6 bottom-3 h-14 rounded-[50%] bg-admin-secondary blur-md ${artBase} group-hover:scale-x-125 group-hover:opacity-70 group-focus-within:scale-x-125 group-focus-within:opacity-70`}
        aria-hidden
      />
      {/* Sliders panel — left prop */}
      <div className={`relative z-[1] ${artSpreadLeft}`}>
        <div className="w-[80px] rounded-xl border border-admin-border bg-admin-surface p-2.5 shadow-sm">
          <div className="space-y-2">
            <div className="h-1 w-full rounded-full bg-admin-secondary relative"><span className="absolute -top-0.5 left-2 h-2 w-2 rounded-full border border-admin-border bg-white" /></div>
            <div className="h-1 w-full rounded-full bg-admin-secondary relative"><span className="absolute -top-0.5 left-8 h-2 w-2 rounded-full border border-admin-border bg-white" /></div>
            <div className="h-1 w-full rounded-full bg-admin-secondary relative"><span className="absolute -top-0.5 left-5 h-2 w-2 rounded-full border border-admin-border bg-white" /></div>
          </div>
        </div>
      </div>
      {/* Bot face — centre lift */}
      <div className={`relative z-[2] mb-3 ${artLiftCenter}`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface shadow-md group-hover:shadow-[0_10px_22px_-10px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
            <rect x="8" y="14" width="32" height="24" rx="8" fill="#1f8a4c" />
            <circle cx="18" cy="25" r="3" fill="#fff" />
            <circle cx="30" cy="25" r="3" fill="#fff" />
            <path d="M19 32 q5 3 10 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M24 14 V8" stroke="#1f8a4c" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="6" r="2.5" fill="#1f8a4c" />
            <rect x="3" y="22" width="4" height="8" rx="2" fill="#1f8a4c" />
            <rect x="41" y="22" width="4" height="8" rx="2" fill="#1f8a4c" />
          </svg>
        </div>
      </div>
      {/* Prompt lines — right prop */}
      <div className={`relative z-[1] ${artSpreadRight}`}>
        <div className="w-[80px] rounded-xl border border-admin-border bg-admin-surface p-2.5 shadow-sm">
          <div className="space-y-1.5">
            <div className="h-1 w-full rounded-full bg-admin-secondary" />
            <div className="h-1 w-4/5 rounded-full bg-admin-secondary" />
            <div className="h-1 w-full rounded-full bg-admin-secondary" />
            <div className="h-1 w-3/5 rounded-full bg-admin-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationIllustration() {
  return (
    <div className="relative flex h-[140px] w-full max-w-[280px] items-end justify-center gap-1">
      <div
        className={`absolute inset-x-6 bottom-3 h-14 rounded-[50%] bg-admin-secondary blur-md ${artBase} group-hover:scale-x-125 group-hover:opacity-70 group-focus-within:scale-x-125 group-focus-within:opacity-70`}
        aria-hidden
      />
      {/* Trigger node — left prop */}
      <div className={`relative z-[1] ${artSpreadLeft}`}>
        <div className="w-[72px] rounded-xl border border-admin-border bg-admin-surface p-2.5 shadow-sm">
          <div className="h-1 w-10 rounded-full bg-admin-fill" />
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
            <div className="h-1 flex-1 rounded-full bg-admin-secondary" />
          </div>
          <div className="mt-1.5 h-1 w-4/5 rounded-full bg-admin-secondary" />
        </div>
      </div>
      {/* Bolt — centre lift */}
      <div className={`relative z-[2] mb-3 ${artLiftCenter}`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-admin-border bg-admin-surface shadow-md group-hover:shadow-[0_10px_22px_-10px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
            <path d="M30 6 L16 26 h9 L20 42 L34 22 h-9 Z" fill="#1f8a4c" />
          </svg>
        </div>
      </div>
      {/* Action node — right prop */}
      <div className={`relative z-[1] ${artSpreadRight}`}>
        <div className="w-[72px] rounded-xl border border-admin-border bg-admin-surface p-2.5 shadow-sm">
          <div className="h-1 w-10 rounded-full bg-admin-fill" />
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#cdfee1]" />
            <div className="h-1 flex-1 rounded-full bg-admin-secondary" />
          </div>
          <div className="mt-1.5 h-1 w-4/5 rounded-full bg-admin-secondary" />
        </div>
      </div>
    </div>
  );
}

// Per-tenant WhatsApp onboarding page (embedded signup / manual / coexistence).
const WHATSAPP_CONNECT_URL = '/client/whatsapp';

export function useSetupFlags() {
  const { currentWorkspace, user, features } = useAuthStore();
  const stores = useStoreStore((s) => s.stores);
  const featureOverrides = (user as unknown as { featureOverrides?: Record<string, unknown> })?.featureOverrides || {};
  return {
    websiteDone: stores.length > 0,
    domainDone: stores.some((s) => !!s.subdomain?.customDomain),
    waConnected: !!currentWorkspace?.whatsapp?.isConnected,
    crmDone: Boolean(
      featureOverrides.industry ||
      (features as Record<string, unknown> | undefined)?.industry ||
      (user as unknown as { industry?: string })?.industry
    ),
  };
}

export default function SetupGuideCards() {
  const { user } = useAuthStore();
  const { websiteDone, domainDone, waConnected, crmDone } = useSetupFlags();
  const firstName = (user?.name || '').trim().split(' ')[0] || 'there';

  return (
    <section aria-label="Workspace setup guide" className="flex flex-col gap-5">
      {/* Offer marquee */}
      <div className="offer-marquee relative -mx-1 overflow-hidden rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-300/80 via-yellow-200/90 to-amber-300/80 px-3 py-2 shadow-[0_8px_24px_-14px_rgba(217,119,6,0.5)]">
        <div className="offer-marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={dup === 1}>
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold tracking-wide text-[#7c4a03]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-600" />
                  Flat 20% off on annual plans — upgrade to Pro before the offer ends
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-semibold tracking-tight text-[#0f2d26]">
            Welcome, {firstName}
          </h2>
          <p className="mt-1 text-[13px] text-[#5f7a72]">
            Let&apos;s get your workspace ready.
          </p>
        </div>
        <Link
          href="/client/online-store"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,0.7)] transition hover:brightness-[1.05] active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
          Open store
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SetupCard
          title="1. Create website"
          description="Pick a theme and build your storefront — pages, products and branding all in one place."
          ctaLabel="Open themes"
          href="/client/themes"
          illustration={<PlansIllustration />}
          connected={websiteDone}
        />
        <SetupCard
          title="2. Connect domain"
          description="Point your custom domain to your new website so customers find you at your own URL."
          ctaLabel="Add domain"
          href="/client/domains"
          illustration={<AutomationIllustration />}
          connected={domainDone}
        />
        <SetupCard
          title="3. Connect WhatsApp"
          description="Connect a Cloud API number or an existing WhatsApp Business app number (coexistence)."
          ctaLabel="Connect"
          href={WHATSAPP_CONNECT_URL}
          illustration={<WhatsAppIllustration />}
          connected={waConnected}
          greenCta
        />
        <SetupCard
          title="4. Set up CRM"
          description="Choose your business type so your CRM, pipelines and inbox match your industry."
          ctaLabel="Set up"
          href="/client/choose-business"
          illustration={<AiIllustration />}
          connected={crmDone}
        />
      </div>
    </section>
  );
}
