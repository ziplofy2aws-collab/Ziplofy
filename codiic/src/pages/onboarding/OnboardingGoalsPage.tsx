import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ONBOARDING_GOALS,
  saveOnboardingGoals,
  type OnboardingGoalId,
} from '../../utils/onboarding.util';
import OnboardingShell from './OnboardingShell';

export default function OnboardingGoalsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<OnboardingGoalId>>(new Set(['sell_online']));

  const toggle = useCallback((id: OnboardingGoalId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onContinue = useCallback(() => {
    saveOnboardingGoals(Array.from(selected));
    navigate('/onboarding/payment');
  }, [navigate, selected]);

  return (
    <OnboardingShell>
      <div className="mb-8 text-center">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem]">
          What can we help you do?
        </h1>
        <p className="mt-2 text-[0.95rem] text-white/75">
          Select all that apply. We&apos;ll tailor your setup.
        </p>
      </div>

      <div className="rounded-[1.75rem] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex flex-wrap gap-2.5">
          {ONBOARDING_GOALS.map((goal) => {
            const isSelected = selected.has(goal.id);
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggle(goal.id)}
                aria-pressed={isSelected}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-[#f1f1f1] text-[#3d3d3d] hover:bg-[#e8e8e8]',
                ].join(' ')}
              >
                {isSelected ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                  </svg>
                ) : (
                  <span className="text-base leading-none" aria-hidden>
                    +
                  </span>
                )}
                {goal.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={selected.size === 0}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  );
}
