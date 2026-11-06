'use client';
import React from 'react';
import Link from 'next/link';
import useBranding from '@/lib/useBranding';
import { authPageBackgroundStyle } from '@/lib/authBackground';

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const brand = useBranding();
  const bgStyle = brand.loginBg
    ? {
        ...authPageBackgroundStyle,
        backgroundImage: `linear-gradient(160deg, rgba(232, 245, 239, 0.55), rgba(236, 253, 245, 0.42)), url(${brand.loginBg})`,
      }
    : authPageBackgroundStyle;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={bgStyle}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <img
              src={brand.logo || '/logo_with_text.webp'}
              alt={brand.name || 'Codiic'}
              className="h-12 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
              {brand.name || 'Codiic'}
            </span>
          </Link>
          {brand.tagline ? (
            <p className="mt-1.5 text-sm text-gray-500">{brand.tagline}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-[#e3e3e3] bg-white/95 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] overflow-hidden backdrop-blur-sm">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' }} />
          <div className="p-7 sm:p-8">
            <div className="mb-6">
              <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </div>

        {footer ? <div className="mt-5 text-center text-sm text-gray-500">{footer}</div> : null}
      </div>
    </div>
  );
}
