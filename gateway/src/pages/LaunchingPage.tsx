import { useEffect, useState } from 'react';
import { api, goToSso } from '../api';
import type { SessionResponse } from '../types';
import Shell from '../components/Shell';

// Strict Mode runs this effect twice. Completing twice mints two tickets and
// the extra redeem fails with "Ticket already used".
let launchInflight: Promise<SessionResponse> | null = null;

function launchOnce() {
  if (!launchInflight) {
    launchInflight = api.complete().catch((err) => {
      launchInflight = null;
      throw err;
    });
  }
  return launchInflight;
}

export default function LaunchingPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    launchOnce()
      .then((data) => {
        if (data.redirect?.ssoUrl) {
          goToSso(data.redirect.ssoUrl);
          return;
        }
        setError('Launch succeeded but no destination was returned.');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not launch the product');
      });
  }, []);

  return (
    <Shell title="Launching your product" subtitle="Provisioning your workspace and signing you in.">
      {error ? <div className="err">{error}</div> : <p className="sub">This only takes a moment…</p>}
    </Shell>
  );
}
