/** Shopify-style admin top bar — mirrors Codiic Navbar. */
export const ADMIN_HEADER_HEIGHT = 56;

export const adminHeaderClass =
  'admin-shopify-header fixed top-0 left-0 right-0 z-[1201] h-14 shrink-0 border-b border-white/10 bg-black';

export const adminHeaderControlClass =
  'admin-header-control inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white transition-colors';

export const adminHeaderIconButtonClass =
  'inline-flex items-center justify-center rounded-lg p-2 text-[#b5b5b5] transition-colors hover:bg-white/10 hover:text-white';

export const adminHeaderSearchClass =
  'admin-header-search h-9 w-full rounded-full border-0 py-0 pl-8 pr-14 text-sm transition-colors';

export const adminHeaderDropdownClass =
  'admin-header-dropdown absolute right-0 top-full z-50 mt-1.5 min-w-[240px] overflow-hidden rounded-xl border border-[#e3e3e3] bg-white py-1.5 shadow-lg';

export const adminHeaderDropdownItemClass = (active?: boolean) =>
  `admin-header-dropdown-item flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#f6f6f7] ${
    active ? 'bg-[#f1f1f1] font-semibold text-[#303030]' : 'font-medium text-[#303030]'
  }`;

export const workspaceAvatarClass =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#aeea00] text-xs font-semibold text-black';
