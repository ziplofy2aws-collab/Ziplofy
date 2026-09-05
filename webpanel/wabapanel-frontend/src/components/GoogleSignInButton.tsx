'use client';

import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

type Props = {
  onCredential: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
};

export default function GoogleSignInButton({
  onCredential,
  onError,
  text = 'continue_with',
  disabled = false,
}: Props) {
  const [clientId, setClientId] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
    fetch(`${base}/auth/google/config`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.success && d.data?.enabled && d.data?.clientId) {
          setClientId(d.data.clientId);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (!ready || !clientId || disabled) return null;

  return (
    <div className="w-full">
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e3e3e3]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-[#98A2B3]">or</span>
        </div>
      </div>
      <div className="flex justify-center [&>div]:w-full [&_iframe]:w-full">
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={async (cred: CredentialResponse) => {
              if (!cred.credential) {
                onError?.('Google did not return a credential');
                return;
              }
              await onCredential(cred.credential);
            }}
            onError={() => onError?.('Google sign-in failed')}
            useOneTap={false}
            theme="outline"
            size="large"
            shape="rectangular"
            text={text}
            width={420}
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}
