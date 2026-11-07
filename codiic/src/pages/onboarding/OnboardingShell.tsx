import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  completeOnboardingAndGoToDashboard,
  getOnboardingGoals,
} from '../../utils/onboarding.util';

interface OnboardingShellProps {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  /** Tailwind max-width class for the content column. */
  maxWidthClass?: string;
}

export default function OnboardingShell({
  children,
  showBack = false,
  onBack,
  maxWidthClass = 'max-w-[560px]',
}: OnboardingShellProps) {
  const [skipping, setSkipping] = useState(false);

  const handleSkip = async () => {
    if (skipping) return;
    setSkipping(true);
    await completeOnboardingAndGoToDashboard({
      goals: getOnboardingGoals(),
      skipped: true,
      completed: true,
    });
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-slate-900"
      style={{
        backgroundColor: '#e8f5ef',
        backgroundImage:
          "linear-gradient(160deg, rgba(232, 245, 239, 0.55), rgba(236, 253, 245, 0.42)), url('/assets/mint-grid-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        <img src="/logo_with_text.webp" alt="CODIIC" className="h-7 w-auto object-contain sm:h-8" />
        <button
          type="button"
          onClick={() => void handleSkip()}
          disabled={skipping}
          className="rounded-xl border border-admin-border bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:bg-white disabled:opacity-60"
        >
          {skipping ? 'Skipping…' : 'Skip'}
        </button>
      </header>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-10 pt-20 sm:px-6">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="mb-4 flex h-10 w-10 items-center justify-center self-start rounded-xl border border-admin-border bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white lg:hidden"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : null}

        <div
          className={`w-full ${maxWidthClass} rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-8`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
