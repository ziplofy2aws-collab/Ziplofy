/**
 * Super-admin token lookup.
 *
 * Read lazily on each call — never snapshot `process.env` at module load.
 * `src/utils/env.utils` populates `process.env` from the dotenv file at import
 * time, but module evaluation order is not guaranteed: a static
 * `export const SUPER_ADMIN_TOKEN = process.env.SUPER_ADMIN_TOKEN` can capture
 * `undefined` before env initialization runs (and permanently disable
 * super-admin authentication in production).
 *
 * The value is configured via the `SUPER_ADMIN_TOKEN` environment variable.
 * Returns `undefined` when unset/blank — callers must treat that as
 * "super-admin token auth disabled" and never bypass JWT verification.
 */
export function getSuperAdminToken(): string | undefined {
  const token = process.env.SUPER_ADMIN_TOKEN;
  return typeof token === 'string' && token.trim().length > 0
    ? token.trim()
    : undefined;
}
