'use client';

/**
 * react-router-dom compatibility shim for the ported create-theme builder.
 * Maps react-router-dom APIs onto next/navigation so copied editor code works
 * unchanged inside the Next.js app router.
 */

import React, { forwardRef, useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (
      to: string | number,
      opts?: { replace?: boolean; state?: unknown }
    ) => {
      if (typeof to === 'number') {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      if (opts?.replace) router.replace(to);
      else router.push(to);
    },
    [router]
  );
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return useMemo(
    () => ({
      pathname: pathname ?? '',
      search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null as unknown,
      key: 'next',
    }),
    [pathname, searchParams]
  );
}

type SetSearchParamsOptions = { replace?: boolean };

export function useSearchParams(): [
  URLSearchParams,
  (
    init:
      | URLSearchParams
      | Record<string, string>
      | ((prev: URLSearchParams) => URLSearchParams | Record<string, string>),
    opts?: SetSearchParamsOptions
  ) => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  const next = useNextSearchParams();
  const params = useMemo(
    () => new URLSearchParams(next?.toString() ?? ''),
    [next]
  );
  const setParams = useCallback(
    (
      init:
        | URLSearchParams
        | Record<string, string>
        | ((prev: URLSearchParams) => URLSearchParams | Record<string, string>),
      opts?: SetSearchParamsOptions
    ) => {
      const resolved = typeof init === 'function' ? init(params) : init;
      const sp =
        resolved instanceof URLSearchParams
          ? resolved
          : new URLSearchParams(resolved);
      const qs = sp.toString();
      const url = qs ? `${pathname}?${qs}` : (pathname ?? '/');
      if (opts?.replace) router.replace(url);
      else router.push(url);
    },
    [params, pathname, router]
  );
  return [params, setParams];
}

export function useParams<T extends Record<string, string>>(): T {
  return useNextParams() as T;
}

type LinkProps = {
  to?: string;
  href?: string;
  replace?: boolean;
  target?: string;
  rel?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  state?: unknown;
  'aria-label'?: string;
  title?: string;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, href, state: _state, ...rest },
  ref
) {
  return <NextLink ref={ref} href={href ?? to ?? '#'} {...rest} />;
});

export const NavLink = Link;

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
}

export function Outlet() {
  return null;
}

export function useResolvedPath(to: string) {
  return { pathname: to };
}
