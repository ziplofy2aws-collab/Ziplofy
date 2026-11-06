import { goToSso } from '../api';
import type { SessionResponse } from '../types';

/** After auth: SSO out, or /launching — never bounce verified users to /login. */
export function continueAfterSession(
  data: SessionResponse,
  navigate: (path: string, opts?: { replace?: boolean }) => void
): void {
  if (data.redirect?.ssoUrl) {
    goToSso(data.redirect.ssoUrl);
    return;
  }
  if (data.needsVerification) {
    navigate('/login', { replace: true });
    return;
  }
  navigate('/launching', { replace: true });
}
