/** Orbitly light top bar — teal search pill accent. */
export const ADMIN_HEADER_HEIGHT = 56;

export const adminHeaderClass =
  'client-orbitly-header fixed top-0 left-0 right-0 z-[1201] h-14 shrink-0 border-b border-[#e8efe9]/70 bg-white/75 backdrop-blur-xl';

export const adminHeaderControlClass =
  'inline-flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-1.5 text-sm font-medium text-[#303030] transition-all duration-200 hover:border-[#e8efe9] hover:bg-[#f4faf5]';

export const adminHeaderIconButtonClass =
  'inline-flex items-center justify-center rounded-xl p-2 text-[#6b7a74] transition-all duration-200 hover:bg-[#eef8f0] hover:text-[#0f3d2e]';

/** Inner search field sitting inside the teal glow capsule. */
export const adminHeaderSearchClass =
  'h-8 w-full rounded-full border-0 bg-[#f7fbf8] py-0 pl-8 pr-14 text-sm text-[#303030] placeholder:text-[#8a9a93] outline-none transition-colors focus:bg-white';

export const adminHeaderDropdownClass =
  'admin-header-dropdown absolute right-0 top-full z-50 mt-1.5 min-w-[240px] max-h-80 overflow-y-auto overflow-hidden rounded-2xl border border-white/50 bg-white/60 py-1.5 shadow-[0_16px_40px_rgba(15,61,46,0.14),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl';

export const adminHeaderDropdownItemClass = (active?: boolean) =>
  `admin-header-dropdown-item flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-all duration-150 hover:bg-black/[0.04] ${
    active ? 'bg-[#eef8f0] font-semibold text-[#00896F]' : 'font-medium text-[#303030]'
  }`;

export const workspaceAvatarClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8f5a8] to-[#d4f4d8] text-xs font-semibold text-[#0f3d2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]';
