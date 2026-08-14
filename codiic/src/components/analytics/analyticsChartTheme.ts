export const ANALYTICS_CHART = {
  primary: '#00a0ac',
  compare: '#8fd4da',
  bar: '#00a0ac',
  barHover: '#00818b',
  grid: '#e3e3e3',
  axis: '#8c9196',
  cursor: 'rgba(0, 160, 172, 0.08)',
  tooltipBorder: '#d1d5db',
  tooltipBg: '#ffffff',
  tooltipText: '#202223',
  tooltipMuted: '#6d7175',
} as const;

export function formatAxisMoney(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  return `₹${Math.round(amount)}`;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export function formatPercent(rate: number): string {
  const pct = (rate || 0) * 100;
  if (!Number.isFinite(pct) || pct === 0) return '0%';
  if (Math.abs(pct) < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

export function formatDays(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0d';
  if (value < 1) return '<1d';
  if (value < 10) return `${value.toFixed(1)}d`;
  return `${Math.round(value)}d`;
}
