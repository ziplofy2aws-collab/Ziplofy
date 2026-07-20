import type { CreateThemeCatalogGroup } from '../types';

export type LayoutOrderRoot = {
  header?: string[];
  footer?: string[];
};

export function getLayoutOrder(config: Record<string, unknown>): LayoutOrderRoot {
  const lo = (config.layout_order ?? {}) as LayoutOrderRoot;
  return {
    header: Array.isArray(lo.header) ? [...lo.header] : [],
    footer: Array.isArray(lo.footer) ? [...lo.footer] : [],
  };
}

export function setLayoutOrder(config: Record<string, unknown>, order: LayoutOrderRoot): void {
  config.layout_order = order;
}

export function layoutListKey(group: CreateThemeCatalogGroup): string {
  return group === 'header' ? 'layout:header-sections' : 'layout:footer-sections';
}

function insertIntoOrder(
  order: string[],
  instanceId: string,
  ctx: { afterNodeId?: string; beforeNodeId?: string }
): string[] {
  const next = [...order];
  const anchorBefore = ctx.beforeNodeId?.startsWith('layout:')
    ? ctx.beforeNodeId.slice('layout:'.length)
    : null;
  const anchorAfter = ctx.afterNodeId?.startsWith('layout:')
    ? ctx.afterNodeId.slice('layout:'.length)
    : null;

  if (anchorBefore && anchorBefore !== 'add-section') {
    const idx = next.indexOf(anchorBefore);
    if (idx >= 0) {
      next.splice(idx, 0, instanceId);
      return next;
    }
  }
  if (anchorAfter && anchorAfter !== 'add-section') {
    const idx = next.indexOf(anchorAfter);
    if (idx >= 0) {
      next.splice(idx + 1, 0, instanceId);
      return next;
    }
  }
  next.push(instanceId);
  return next;
}

export function appendToLayoutOrder(
  config: Record<string, unknown>,
  group: 'header' | 'footer',
  instanceId: string,
  ctx: { afterNodeId?: string; beforeNodeId?: string }
): void {
  const order = getLayoutOrder(config);
  const key = group === 'header' ? 'header' : 'footer';
  order[key] = insertIntoOrder(order[key] ?? [], instanceId, ctx);
  setLayoutOrder(config, order);
}
