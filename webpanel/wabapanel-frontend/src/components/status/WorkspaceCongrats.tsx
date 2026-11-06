'use client';

import React from 'react';
import { FlowButton } from '@/components/ui/flow-button';

type WorkspaceCongratsProps = {
  onStart: () => void;
  starting?: boolean;
};

/** Full-screen congratulations — slow emerald text reveal + Start. */
export default function WorkspaceCongrats({ onStart, starting }: WorkspaceCongratsProps) {
  return (
    <div
      className="fixed inset-0 z-[100000] flex min-h-screen items-center justify-center overflow-hidden px-5 py-10"
      style={{
        backgroundColor: '#e8f5ef',
        backgroundImage:
          "linear-gradient(160deg, rgba(232, 245, 239, 0.78), rgba(236, 253, 245, 0.58)), url('/assets/mint-grid-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workspace-congrats-title"
    >
      <div className="congrats-glow pointer-events-none absolute left-1/2 top-[28%] h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[18%] right-[12%] h-40 w-40 rounded-full bg-teal-200/30 blur-3xl" />

      <div className="relative w-full max-w-lg text-center">
        <p className="congrats-reveal text-[12px] font-semibold uppercase tracking-[0.22em] text-emerald-800/70">
          Congratulations
        </p>

        <div className="congrats-reveal congrats-reveal--delay-1 mx-auto mt-5 h-px w-16 congrats-accent-line bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

        <h2
          id="workspace-congrats-title"
          className="congrats-reveal congrats-reveal--delay-2 congrats-title-gradient mt-6 text-[28px] font-bold leading-tight tracking-tight sm:text-[34px]"
        >
          You&apos;re ready to start
          <br />
          building and automate
        </h2>

        <p className="congrats-reveal congrats-reveal--delay-3 mx-auto mt-5 max-w-sm text-[15px] leading-relaxed text-slate-600/90">
          Your workspace is live. Build flows, run campaigns, and grow on WhatsApp — all in one place.
        </p>

        <div className="congrats-reveal congrats-reveal--delay-4 mt-9 flex justify-center">
          <FlowButton
            text={starting ? 'Starting…' : 'Start'}
            className="min-w-[180px]"
            disabled={starting}
            onClick={onStart}
          />
        </div>
      </div>
    </div>
  );
}
