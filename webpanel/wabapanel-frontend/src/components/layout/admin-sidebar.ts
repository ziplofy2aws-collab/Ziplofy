/** Orbitly glass left rail — lime→mint active pills + soft motion. */
export const ADMIN_SIDEBAR_WIDTH = 248;
export const ADMIN_SIDEBAR_COLLAPSED_WIDTH = 72;

export const adminSidebarAsideClass =
  'client-orbitly-aside fixed left-0 top-14 z-[1100] flex h-[calc(100vh-3.5rem)] shrink-0 flex-col overflow-hidden border-r border-[#e8efe9]/80 bg-white/55 backdrop-blur-2xl transition-[width] duration-300 ease-in-out';

export const adminSidebarNavItemClass = (active: boolean, collapsed = false) =>
  `relative z-10 flex w-full items-center rounded-xl text-left text-sm font-medium transition-all duration-200 ease-out select-none ${
    collapsed ? 'justify-center gap-0 px-0 py-2.5' : 'gap-3 px-3 py-2.5'
  } ${
    active
      ? 'bg-gradient-to-r from-[#e8f5a8]/95 via-[#d4f4d8] to-[#c8efe0] text-[#0f3d2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_16px_rgba(15,61,46,0.08)] backdrop-blur-sm'
      : 'text-[#3d4a45] hover:bg-black/[0.04] hover:text-[#0f3d2e]'
  }`;

export const adminSidebarChildItemClass = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-xl px-3 py-1.5 pl-10 text-left text-xs font-medium transition-all duration-200 ease-out select-none ${
    active
      ? 'bg-gradient-to-r from-[#e8f5a8]/80 via-[#d4f4d8] to-[#c8efe0] text-[#0f3d2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
      : 'text-[#6b7a74] hover:bg-black/[0.04] hover:text-[#0f3d2e]'
  }`;
