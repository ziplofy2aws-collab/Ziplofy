/** Shared Orbitly glass surfaces for client dashboard. */
export const dashboardCardShell =
  'rounded-2xl border border-white/50 bg-white/55 p-4 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_14px_36px_rgba(15,61,46,0.1)]';

export const dashboardChartCardShell =
  'min-h-[320px] rounded-2xl border border-white/50 bg-white/55 p-5 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl';

export const dashboardSectionWrap =
  'rounded-2xl border border-white/50 bg-white/55 p-4 sm:p-5 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl';

export const dashboardSectionTitleClass =
  'text-[13px] font-semibold uppercase tracking-wide text-[#8a9a93]';

export const dashboardLinkClass =
  'text-[13px] font-semibold text-[#0f766e] hover:underline';

export const dashboardPageTitleClass =
  'text-[20px] font-semibold tracking-tight text-[#101828]';

export const dashboardPageSubtitleClass =
  'mt-1 text-[13px] text-[#6b7a74]';

export const dashboardFieldClass =
  'w-full rounded-2xl border border-white/80 bg-white/75 px-3.5 py-2.5 text-[13px] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-slate-400 focus:border-emerald-400/70 focus:bg-white/90 focus:ring-4 focus:ring-emerald-500/15';

export const dashboardLabelClass =
  'mb-1.5 block text-[13px] font-semibold text-slate-800';

export const ADMIN_CONTENT_MAX_WIDTH = 1000;

export const adminContentColumnClass = 'mx-auto w-full max-w-[1000px]';

/** Primary CTA — teal accent matching search capsule. */
export const adminListPrimaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00896F] px-3.5 py-2 text-[13px] font-medium text-white shadow-[0_6px_16px_rgba(0,137,111,0.25)] transition-all duration-200 hover:bg-[#007a63] hover:shadow-[0_8px_20px_rgba(0,137,111,0.32)] disabled:opacity-60';

export const adminListSecondaryButtonClass =
  'inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/50 px-3.5 py-2 text-[13px] font-medium text-[#303030] backdrop-blur-md transition-all duration-200 hover:bg-white/75';

/** Drop-in aliases used by many list pages. */
export const primaryBtn = adminListPrimaryButtonClass;
export const secondaryBtn = adminListSecondaryButtonClass;

/** Soft mint glass callout — replaces flat amber/yellow warning boxes. */
export const dashboardNoticeClass =
  'rounded-2xl border border-[#aee9d1]/80 bg-gradient-to-br from-[#eef8f0]/95 via-white/55 to-white/40 p-4 text-[12px] leading-relaxed text-[#3d4a45] shadow-[0_8px_28px_rgba(15,61,46,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl';

/** Compact inline notice (same palette, tighter padding). */
export const dashboardNoticeCompactClass =
  'rounded-xl border border-[#aee9d1]/80 bg-[#eef8f0]/70 px-3 py-2.5 text-[12px] leading-relaxed text-[#3d4a45] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md';

/** Important / safety callout with glass mint surface. */
export const dashboardSafetyClass =
  'relative overflow-hidden rounded-2xl border border-[#aee9d1]/70 bg-gradient-to-br from-[#eef8f0]/95 via-white/55 to-white/45 p-4 shadow-[0_8px_28px_rgba(15,61,46,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl';

/** Primary stat number — matches “Today at a glance” sizing. */
export const dashboardStatValueClass =
  'mt-1.5 text-xl font-bold tabular-nums leading-tight text-[#101828]';

/** Longer compound stats (e.g. “0 upcoming / 5”, “₹0.00”). */
export const dashboardStatValueCompactClass =
  'mt-1.5 text-[15px] font-semibold leading-snug text-[#101828]';

export function dashboardStatValueClassFor(value: string | number): string {
  const s = String(value);
  if (s.length > 9 || /[/()]/.test(s) || /\srunning\b/i.test(s) || /\bupcoming\b/i.test(s) || /\bapproved\b/i.test(s)) {
    return dashboardStatValueCompactClass;
  }
  return dashboardStatValueClass;
}
