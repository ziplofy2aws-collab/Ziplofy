import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, applySession, goToSso } from '../api';
import LoadingOnly from '../components/LoadingOnly';
import { FlowButton } from '../components/ui/flow-button';
import type { SessionResponse } from '../types';

let launchInflight: Promise<SessionResponse> | null = null;

function launchOnce() {
  if (!launchInflight) {
    launchInflight = api
      .me()
      .then((data) => {
        if (data.redirect?.ssoUrl) return data;
        return api.complete();
      })
      .catch((err) => {
        launchInflight = null;
        throw err;
      });
  }
  return launchInflight;
}

export default function LaunchingPage() {
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    launchOnce()
      .then((data) => {
        if (cancelled) return;
        applySession(data);
        if (data.redirect?.ssoUrl) {
          goToSso(data.redirect.ssoUrl);
          return;
        }
        setError('Workspace is ready but no sign-in link was returned. Retry or log in again.');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not open your workspace');
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  if (!error) {
    return <LoadingOnly />;
  }

  return (
    <div className="shell">
      <div className="card">
        <h1 className="brand">Opening your workspace</h1>
        <div className="err">{error}</div>
        <p className="sub" style={{ marginTop: 12 }}>
          Make sure webpanel API (:5001) and app (:3002) are running, then retry.
        </p>
        <div style={{ marginTop: 16 }}>
          <FlowButton
            text="Retry"
            onClick={() => {
              launchInflight = null;
              setError('');
              setRetryKey((n) => n + 1);
            }}
          />
        </div>
        <p className="switch" style={{ marginTop: 16 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
