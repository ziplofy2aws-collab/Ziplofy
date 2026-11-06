'use client';

import React, { useEffect, useState } from 'react';
import AuthPageBackdrop, { BrandMark } from './AuthPageBackdrop';
import LoadingLottie from './LoadingLottie';

type AppStatusVariant = 'loading' | 'offline';

type AppStatusScreenProps = {
  variant?: AppStatusVariant;
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  className?: string;
  onRetry?: () => void;
  /** Loader only — no brand, title, or subtitle. Defaults on for loading. */
  silent?: boolean;
};

const COPY: Record<AppStatusVariant, { title: string; subtitle: string }> = {
  loading: {
    title: 'Loading your workspace',
    subtitle: 'Hang tight we are setting things up',
  },
  offline: {
    title: "You're offline",
    subtitle: 'Check your connection, then try again.',
  },
};

function AnimatedDots() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCount((n) => (n % 4) + 1);
    }, 420);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="inline-flex min-w-[1.6em] justify-start tracking-[0.08em]" aria-hidden>
      {'.'.repeat(count)}
      <span className="invisible">{'.'.repeat(4 - count)}</span>
    </span>
  );
}

function stripTrailingDots(text: string) {
  return text.replace(/[\s.…]*$/u, '').replace(/\s*[—–-]\s*/g, ' ').trim();
}

export default function AppStatusScreen({
  variant = 'loading',
  title,
  subtitle,
  fullScreen = true,
  className = '',
  onRetry,
  silent,
}: AppStatusScreenProps) {
  const copy = COPY[variant];
  const resolvedTitle = title || copy.title;
  const subtitleBase = stripTrailingDots(subtitle || copy.subtitle);
  const isSilent = silent ?? variant === 'loading';

  if (isSilent) {
    const silentBody = (
      <div
        className={`flex w-full flex-col items-center justify-center ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-busy={variant === 'loading'}
        aria-label={resolvedTitle}
      >
        <LoadingLottie className="relative h-44 w-44 sm:h-52 sm:w-52" />
      </div>
    );

    if (!fullScreen) return silentBody;

    return (
      <div className="fixed inset-0 z-[9999]">
        <AuthPageBackdrop className="flex min-h-screen items-center justify-center">
          {silentBody}
        </AuthPageBackdrop>
      </div>
    );
  }

  const content = (
    <div
      className={`flex w-full flex-col items-center justify-center px-6 py-16 ${className}`.trim()}
    >
      <div className="page-blur-transition page-blur-transition--in w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/45 px-6 py-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:px-8">
        <div className="mb-6 flex justify-center">
          <BrandMark size="md" />
        </div>
        <LoadingLottie className="relative mx-auto mb-2 h-40 w-40 sm:h-48 sm:w-48" />
        <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {resolvedTitle}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          {subtitleBase}
          {variant === 'loading' ? <AnimatedDots /> : null}
        </p>
        {variant === 'offline' && (
          <button
            type="button"
            onClick={onRetry || (() => window.location.reload())}
            className="mt-6 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(5,150,105,0.28)] transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );

  if (!fullScreen) {
    return (
      <div role="status" aria-live="polite" aria-busy={variant === 'loading'}>
        {content}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={variant === 'loading'}
      className="fixed inset-0 z-[9999]"
    >
      <AuthPageBackdrop className="flex min-h-screen items-center justify-center">
        {content}
      </AuthPageBackdrop>
    </div>
  );
}
