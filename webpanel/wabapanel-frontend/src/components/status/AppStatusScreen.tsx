'use client';

import React from 'react';
import AuthPageBackdrop from './AuthPageBackdrop';
import LoadingLottie from './LoadingLottie';

type AppStatusVariant = 'loading' | 'offline';

type AppStatusScreenProps = {
  variant?: AppStatusVariant;
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  className?: string;
  onRetry?: () => void;
  /** Kept for call-site compat — always loader-only. */
  silent?: boolean;
};

/** Full-screen / inline status — Lottie only, no copy. */
export default function AppStatusScreen({
  variant = 'loading',
  fullScreen = true,
  className = '',
}: AppStatusScreenProps) {
  const body = (
    <div
      className={`flex w-full flex-col items-center justify-center ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy={variant === 'loading' || variant === 'offline'}
      aria-label={variant === 'offline' ? 'Offline' : 'Loading'}
    >
      <LoadingLottie className="relative h-44 w-44 sm:h-52 sm:w-52" />
    </div>
  );

  if (!fullScreen) return body;

  return (
    <div className="fixed inset-0 z-[9999]">
      <AuthPageBackdrop className="flex min-h-screen items-center justify-center">
        {body}
      </AuthPageBackdrop>
    </div>
  );
}
