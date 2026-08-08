/** Shared admin left-rail dimensions — keep `/` and `/settings` sidebars identical. */
export const ADMIN_SIDEBAR_WIDTH = 240;

export const adminSidebarAsideClass =
  'fixed left-0 top-14 z-50 flex h-[calc(100vh-56px)] w-[240px] shrink-0 flex-col border-r border-admin-border bg-admin-sidebar';

export const adminSidebarNavItemClass = (active: boolean) =>
  `relative z-10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
    active
      ? 'bg-admin-surface font-medium text-admin-text shadow-[0_1px_0_rgba(0,0,0,0.05)]'
      : 'text-admin-text hover:bg-admin-fill'
  }`;

export const adminSidebarChildItemClass = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-lg px-3 py-1.5 pl-10 text-left transition-colors ${
    active
      ? 'bg-admin-surface font-medium text-admin-text shadow-[0_1px_0_rgba(0,0,0,0.05)]'
      : 'text-admin-text-secondary hover:bg-admin-fill'
  }`;
