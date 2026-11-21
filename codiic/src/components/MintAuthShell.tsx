import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export type AuthMode = 'login' | 'signup';

type Props = {
  mode: AuthMode;
  /** Real auth button (e.g. GoogleLogin) rendered invisibly over the styled Google button. */
  googleButton?: ReactNode;
  children: ReactNode;
};

const MODES: { mode: AuthMode; label: string; to: string }[] = [
  { mode: 'signup', label: 'Sign up', to: '/register' },
  { mode: 'login', label: 'Log in', to: '/login' },
];

const PERKS = [
  'Website, CRM, pipeline & automation in one login',
  'WhatsApp and UPI built in',
  'Cancel anytime — no lock-in',
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.5v2.9h3.9c2.2-2.1 3.5-5.1 3.5-8.6z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-2.9c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3C3.4 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.5c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3v-3H1.4C.5 8.6 0 10.3 0 12.2s.5 3.6 1.4 5.3l4-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.6l4 3c.9-2.7 3.5-4.8 6.6-4.8z"
      />
    </svg>
  );
}

/** Shared split-screen auth shell — left form column + right emerald brand panel. */
export default function MintAuthShell({ mode, googleButton, children }: Props) {
  return (
    <div className="grid min-h-screen bg-[#F4F8F6] text-[#171923] lg:grid-cols-2">
      {/* Form column */}
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="CODIIC home">
            <img src="/logo_with_text.webp" alt="CODIIC" className="h-9 w-auto object-contain" />
          </Link>
          <a
            href="https://codiic.com"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A6270] transition-colors hover:text-[#171923]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">
              {mode === 'signup' ? 'Start at ₹1/day' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-[15px] text-[#5A6270]">
              {mode === 'signup'
                ? 'Create your CODIIC workspace in under 2 minutes.'
                : 'Log in to your CODIIC workspace.'}
            </p>

            {/* Segmented switcher */}
            <div className="mt-7 grid grid-cols-2 rounded-full bg-[#E3ECE8] p-1">
              {MODES.map((item) => (
                <Link
                  key={item.mode}
                  to={item.to}
                  className={`cursor-pointer rounded-full py-2 text-center text-sm font-semibold transition-colors ${
                    mode === item.mode
                      ? 'bg-white text-[#171923] shadow-sm'
                      : 'text-[#5A6270] hover:text-[#171923]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Google auth — styled button with the real (invisible) GoogleLogin on top */}
            <div className="relative mt-6">
              <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#DCE3DF] bg-white py-3 text-sm font-semibold">
                <GoogleMark />
                Continue with Google
              </div>
              {googleButton}
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-[#8A919C]">
              <span className="h-px flex-1 bg-[#DCE3DF]" />
              or with email
              <span className="h-px flex-1 bg-[#DCE3DF]" />
            </div>

            {children}

            <p className="mt-6 text-center text-xs text-[#8A919C]">
              By continuing you agree to CODIIC&apos;s Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Brand panel */}
      <aside className="m-3 hidden flex-col overflow-hidden rounded-[28px] bg-[#00A06A] p-12 text-white lg:flex">
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 py-1 pl-1 pr-3.5 text-sm font-semibold">
          <span className="flex h-6 items-center rounded-full bg-[#FFD84D] px-2 text-xs font-extrabold text-[#1F1A05]">
            ₹1
          </span>
          per day, all tools included
        </span>

        <h2 className="mt-8 max-w-md text-5xl font-bold leading-[1.05] tracking-[-0.035em]">
          All your business. <em className="font-serif font-normal italic">One platform.</em>
        </h2>

        <ul className="mt-8 space-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-[15px] text-white/90">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <figure className="mt-auto rounded-2xl bg-[#111A16] p-6">
          <blockquote className="text-[15px] leading-relaxed text-white/85">
            &ldquo;We replaced three disconnected tools in less than a week. Inquiries now land
            straight in our CRM and on WhatsApp.&rdquo;
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0EA5E9] text-sm font-bold">
              RM
            </span>
            <span>
              <span className="block text-sm font-semibold">Rohan Mehta</span>
              <span className="block text-xs text-white/50">Co-Founder, Apex Logistics</span>
            </span>
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}
