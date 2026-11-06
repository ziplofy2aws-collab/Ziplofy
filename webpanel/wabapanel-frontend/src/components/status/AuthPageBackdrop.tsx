'use client';

import React from 'react';
import useBranding from '@/lib/useBranding';
import { AUTH_BG_IMAGE, authPageBackgroundStyle } from '@/lib/authBackground';

type AuthPageBackdropProps = {
  children: React.ReactNode;
  className?: string;
};

/** Shared soft login-style canvas used by auth + onboarding screens. */
export default function AuthPageBackdrop({ children, className = '' }: AuthPageBackdropProps) {
  const brand = useBranding();
  const bgStyle = brand.loginBg
    ? {
        backgroundColor: '#e8f5ef',
        backgroundImage: `linear-gradient(160deg, rgba(232, 245, 239, 0.55), rgba(236, 253, 245, 0.42)), url(${brand.loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : authPageBackgroundStyle;

  return (
    <div className={`relative min-h-screen overflow-x-hidden antialiased text-slate-900 ${className}`.trim()} style={bgStyle}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function BrandMark({ size = 'md', showName = false }: { size?: 'sm' | 'md' | 'lg'; showName?: boolean }) {
  const brand = useBranding();
  const height = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-7' : 'h-8';
  const name = brand.name || 'Codiic';
  const src = brand.logo || '/logo_with_text.webp';

  return (
    <div className="inline-flex items-center gap-2.5">
      <img src={src} alt={name} className={`${height} w-auto object-contain`} />
      {showName || brand.logo ? (
        <span className="text-[15px] font-bold tracking-tight text-[#101828]">{name.replace(/\s*Panel$/i, '') || 'Codiic'}</span>
      ) : null}
    </div>
  );
}

export { AUTH_BG_IMAGE };
