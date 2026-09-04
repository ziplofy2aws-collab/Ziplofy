/** Shared Shopify-style surfaces for client dashboard (Codiic parity). */
export const dashboardCardShell =
  'rounded-xl border border-admin-border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_2px_6px_rgba(16,24,40,0.08)]';

export const dashboardChartCardShell =
  'min-h-[320px] rounded-xl border border-admin-border bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]';

export const dashboardSectionWrap =
  'rounded-xl border border-admin-border bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]';

export const dashboardSectionTitleClass =
  'text-[13px] font-semibold uppercase tracking-wide text-admin-text-subdued';

export const dashboardLinkClass =
  'text-[13px] font-semibold text-[#005bd3] hover:underline';

export const ADMIN_CONTENT_MAX_WIDTH = 1000;

export const adminContentColumnClass = 'mx-auto w-full max-w-[1000px]';

/** Primary CTA on list/banner rows (black Shopify-style). */
export const adminListPrimaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-md bg-black px-3 py-2 text-[13px] font-medium text-white hover:bg-neutral-800 disabled:opacity-60';

export const adminListSecondaryButtonClass =
  'inline-flex items-center justify-center rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]';

/** Primary stat number — matches “Today at a glance” sizing. */
export const dashboardStatValueClass =
  'mt-1.5 text-xl font-bold tabular-nums leading-tight text-admin-text';

/** Longer compound stats (e.g. “0 upcoming / 5”, “₹0.00”). */
export const dashboardStatValueCompactClass =
  'mt-1.5 text-[15px] font-semibold leading-snug text-admin-text';

export function dashboardStatValueClassFor(value: string | number): string {
  const s = String(value);
  if (s.length > 9 || /[/()]/.test(s) || /\srunning\b/i.test(s) || /\bupcoming\b/i.test(s) || /\bapproved\b/i.test(s)) {
    return dashboardStatValueCompactClass;
  }
  return dashboardStatValueClass;
}
