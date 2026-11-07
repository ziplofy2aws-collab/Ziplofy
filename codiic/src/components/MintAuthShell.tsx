import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

/** Shared mint-glass auth shell — matches gateway / webpanel cool UI. */
export default function MintAuthShell({ children, title, subtitle }: Props) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-10"
      style={{
        backgroundColor: '#e8f5ef',
        backgroundImage:
          "linear-gradient(160deg, rgba(232, 245, 239, 0.55), rgba(236, 253, 245, 0.42)), url('/assets/mint-grid-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white/70 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-8">
        <div className="mb-6 flex justify-center">
          <img src="/logo_with_text.webp" alt="CODIIC" className="h-10 w-auto object-contain" />
        </div>
        {title ? (
          <h1 className="mb-1 text-center text-[22px] font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mb-6 text-center text-[13px] leading-relaxed text-slate-500">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
