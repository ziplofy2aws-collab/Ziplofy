/** Shared admin left-rail dimensions — keep `/` and `/settings` sidebars identical. */
export const ADMIN_SIDEBAR_WIDTH = 240;

export const adminSidebarAsideClass =
  'fixed left-0 top-14 z-50 flex h-[calc(100vh-56px)] w-[240px] shrink-0 flex-col border-r border-admin-border bg-admin-sidebar/90 shadow-[4px_0_24px_rgba(15,23,42,0.04)] backdrop-blur-xl';

export const adminSidebarNavItemClass = (active: boolean) =>
  `relative z-10 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-200 ${
    active
      ? 'bg-white/90 font-semibold text-admin-text shadow-[0_8px_20px_rgba(5,150,105,0.10)] ring-1 ring-admin-border'
      : 'text-admin-text hover:bg-white/55'
  }`;

export const adminSidebarChildItemClass = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-lg px-3 py-1.5 pl-10 text-left transition-all duration-200 ${
    active
      ? 'bg-white/90 font-semibold text-admin-text shadow-[0_4px_12px_rgba(5,150,105,0.08)] ring-1 ring-admin-border'
      : 'text-admin-text-secondary hover:bg-white/50'
  }`;
