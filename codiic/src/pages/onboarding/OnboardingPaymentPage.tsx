import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  completeOnboardingAndGoToDashboard,
  getOnboardingGoals,
} from '../../utils/onboarding.util';
import OnboardingShell from './OnboardingShell';

type PaymentTab = 'card' | 'upi';

const INTRO_PRICE = 20;
const FULL_PRICE = 1994;
const TRIAL_DAYS = 3;
const INTRO_MONTHS = 3;

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OnboardingPaymentPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PaymentTab>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timeline = useMemo(() => {
    const today = new Date();
    const trialEnd = addDays(today, TRIAL_DAYS);
    const renewDate = addMonths(trialEnd, INTRO_MONTHS);
    return {
      trialEndLabel: formatShortDate(trialEnd),
      renewLabel: formatLongDate(renewDate),
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (tab === 'upi') {
      return /^[\w.\-]+@[\w.\-]+$/.test(upiId.trim());
    }
    const digits = cardNumber.replace(/\s/g, '');
    return digits.length >= 12 && expiry.trim().length >= 4 && cvv.trim().length >= 3;
  }, [tab, upiId, cardNumber, expiry, cvv]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit || submitting) return;
      setSubmitting(true);
      setError('');
      try {
        const paymentHint = tab === 'upi' ? upiId.trim() : cardNumber.replace(/\s/g, '');
        await completeOnboardingAndGoToDashboard({
          goals: getOnboardingGoals(),
          paymentMethod: tab,
          paymentHint,
          planName: 'Basic',
          introPrice: INTRO_PRICE,
          completed: true,
        });
      } catch {
        setError('Something went wrong. Please try again.');
        setSubmitting(false);
      }
    },
    [canSubmit, submitting, tab, upiId, cardNumber]
  );

  return (
    <OnboardingShell showBack onBack={() => navigate('/onboarding')} maxWidthClass="max-w-[920px]">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1a1a1a] shadow-2xl lg:grid lg:grid-cols-2">
        {/* Summary */}
        <div className="bg-[#1c1c1c] p-6 sm:p-8">
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-white sm:text-[1.85rem]">
            Start for free, stay for {formatInr(INTRO_PRICE)}
          </h1>

          <dl className="mt-8 space-y-0 divide-y divide-white/10">
            <div className="flex items-baseline justify-between gap-4 py-3.5 first:pt-0">
              <dt className="text-sm text-white/70">Today</dt>
              <dd className="text-sm font-medium text-white">{TRIAL_DAYS} days free</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="text-sm text-white/70">{timeline.trialEndLabel}</dt>
              <dd className="text-right text-sm font-medium text-white">
                <span className="mr-1.5 text-white/45 line-through">{formatInr(FULL_PRICE)}</span>
                {formatInr(INTRO_PRICE)}/mo for {INTRO_MONTHS} months
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3.5 last:pb-0">
              <dt className="text-sm text-white/70">Always</dt>
              <dd className="text-sm font-medium text-white">Cancel anytime</dd>
            </div>
          </dl>
        </div>

        {/* Payment form */}
        <div className="bg-white p-6 text-gray-900 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#1a4d9e]">
            Includes domain offer
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
              <path
                fillRule="evenodd"
                d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#f3f3f3] p-1">
            <button
              type="button"
              onClick={() => setTab('card')}
              className={[
                'rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                tab === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
              ].join(' ')}
            >
              Credit Card
            </button>
            <button
              type="button"
              onClick={() => setTab('upi')}
              className={[
                'rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                tab === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
              ].join(' ')}
            >
              UPI
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {tab === 'upi' ? (
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter a UPI ID (e.g. username@oksbi)"
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card number"
                  autoComplete="cc-number"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    autoComplete="cc-exp"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV"
                    autoComplete="cc-csc"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
            )}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full rounded-xl bg-black px-4 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Processing…' : `Subscribe for ${formatInr(INTRO_PRICE)}`}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-gray-500">
              Renews {timeline.renewLabel} on Basic plan, {formatInr(FULL_PRICE)}/mo + tax. Cancel
              before {TRIAL_DAYS}-day free trial ends to avoid charges.
            </p>
          </form>
        </div>
      </div>
    </OnboardingShell>
  );
}
