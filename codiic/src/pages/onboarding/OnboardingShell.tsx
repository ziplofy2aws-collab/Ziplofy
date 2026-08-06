import type { ReactNode } from 'react';
import { useState } from 'react';
import codiicLogo from '../../assets/codiic-logo.png';
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0b0b] text-white">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        <img src={codiicLogo} alt="Codiic" className="h-7 w-auto brightness-0 invert sm:h-8" />
        <button
          type="button"
          onClick={() => void handleSkip()}
          disabled={skipping}
          className="rounded-lg bg-[#2a2a2a] px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#3a3a3a] disabled:opacity-60"
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
            className="mb-4 flex h-10 w-10 items-center justify-center self-start rounded-xl bg-[#2a2a2a] text-white transition-colors hover:bg-[#3a3a3a] lg:hidden"
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
        <div className={`relative w-full ${maxWidthClass}`}>
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="absolute -left-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-[#2a2a2a] text-white transition-colors hover:bg-[#3a3a3a] lg:flex"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
