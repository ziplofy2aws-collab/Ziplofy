'use client';

import type { ButtonHTMLAttributes } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export type FlowButtonProps = {
  text?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export function FlowButton({
  text = 'Modern Button',
  className = '',
  disabled,
  type = 'button',
  ...rest
}: FlowButtonProps) {
  const isDisabled = Boolean(disabled);

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        'group relative flex h-12 w-full items-center justify-center gap-1 overflow-hidden rounded-[100px]',
        'border-[1.5px] border-[#333333]/40 bg-transparent px-8',
        'text-sm font-semibold text-[#111111] cursor-pointer',
        'transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
        'hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.97]',
        'disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-[#333333]/40',
        'disabled:hover:text-[#111111] disabled:hover:rounded-[100px] disabled:active:scale-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <ArrowRight className="pointer-events-none absolute left-[-25%] z-[9] h-4 w-4 fill-none stroke-[#111111] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-5 group-hover:stroke-white group-disabled:group-hover:left-[-25%] group-disabled:group-hover:stroke-[#111111]" />

      <span className="relative z-[1] -translate-x-3 transition-all duration-[800ms] ease-out group-hover:translate-x-3 group-disabled:group-hover:-translate-x-3">
        {text}
      </span>

      <span className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#111111] opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[560px] group-hover:w-[140%] group-hover:opacity-100 group-disabled:group-hover:h-4 group-disabled:group-hover:w-4 group-disabled:group-hover:opacity-0" />

      <ArrowRight className="pointer-events-none absolute right-5 z-[9] h-4 w-4 fill-none stroke-[#111111] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%] group-hover:stroke-white group-disabled:group-hover:right-5 group-disabled:group-hover:stroke-[#111111]" />
    </button>
  );
}

export function FlowButtonLoading({
  text = 'Please wait…',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled
      className={[
        'relative flex h-12 w-full cursor-wait items-center justify-center gap-2 overflow-hidden',
        'rounded-[12px] border-[1.5px] border-transparent bg-[#111111] px-8',
        'text-sm font-semibold text-white opacity-95',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{text}</span>
    </button>
  );
}
