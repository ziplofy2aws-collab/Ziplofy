/** Orbitly light top bar — thin border, soft shadow, teal search pill. */
export const ADMIN_HEADER_HEIGHT = 56;

export const adminHeaderClass =
  'client-orbitly-header fixed top-0 left-0 right-0 z-[1201] h-14 shrink-0 border-b border-[#dfe8e2]/90 bg-white/80 backdrop-blur-xl';

export const adminHeaderControlClass =
  'inline-flex h-9 items-center gap-1.5 rounded-xl border border-transparent px-2 py-1.5 text-[13px] font-medium text-[#303030] transition-all duration-200 hover:border-[#e8efe9] hover:bg-[#f4faf5]';

export const adminHeaderIconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7a74] transition-all duration-200 hover:bg-[#eef8f0] hover:text-[#0f3d2e]';

/** Inner search field sitting inside the teal glow capsule. */
export const adminHeaderSearchClass =
  'h-8 w-full rounded-full border-0 bg-[#f7fbf8] py-0 pl-8 pr-14 text-sm text-[#303030] placeholder:text-[#8a9a93] outline-none transition-colors focus:bg-white';

export const adminHeaderDropdownClass =
  'admin-header-dropdown absolute right-0 top-full z-50 mt-1.5 min-w-[240px] max-h-80 overflow-y-auto overflow-hidden rounded-2xl border border-white/60 bg-white/70 py-1.5 shadow-[0_12px_32px_rgba(15,61,46,0.12),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl';

export const adminHeaderDropdownItemClass = (active?: boolean) =>
  `admin-header-dropdown-item flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-all duration-150 hover:bg-black/[0.04] ${
    active ? 'bg-[#eef8f0] font-semibold text-[#00896F]' : 'font-medium text-[#303030]'
  }`;

export const workspaceAvatarClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8f5a8] to-[#d4f4d8] text-[11px] font-semibold text-[#0f3d2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]';

/** Compact plan chip next to the logo — mint pill + chevron. */
export const adminHeaderPlanChipClass =
  'inline-flex items-center gap-1 rounded-full border border-[#d8eee0] bg-[#eef8f0] px-3 py-1 text-[12px] font-semibold tracking-[-0.01em] text-[#303030] shadow-[0_1px_2px_rgba(15,61,46,0.04)] transition hover:border-[#c5e6d0] hover:bg-[#e6f5ea]';
