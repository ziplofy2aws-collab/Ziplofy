import type { CSSProperties } from 'react';

/** Shared mint-grid backdrop used on login, register, and onboarding. */
export const AUTH_BG_IMAGE = '/assets/mint-grid-bg.png';

export const authPageBackgroundStyle: CSSProperties = {
  backgroundColor: '#e8f5ef',
  backgroundImage: `linear-gradient(160deg, rgba(232, 245, 239, 0.55), rgba(236, 253, 245, 0.42)), url(${AUTH_BG_IMAGE})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};
