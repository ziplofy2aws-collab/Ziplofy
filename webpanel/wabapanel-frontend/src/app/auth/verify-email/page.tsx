'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, XCircle, Loader2 } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import { authApi } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const didRun = React.useRef(false);
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    if (!token) {
      setStatus('error');
      setMessage('Verification link is missing or invalid.');
      return;
    }
    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Invalid or expired verification link.');
      });
  }, [token]);

  const title =
    status === 'loading' ? 'Verifying email' :
    status === 'success' ? 'Email verified' :
    'Verification failed';

  return (
    <AuthShell title={title} subtitle={status === 'loading' ? 'Please wait a moment…' : undefined}>
      <div className="text-center">
        {status === 'loading' && (
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-500 mb-5">{message}</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)]"
              style={{ background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' }}
            >
              Sign In
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <p className="text-sm text-gray-500 mb-5">{message}</p>
            <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-800 text-sm">
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f1f1f1]"><p className="text-gray-400 text-sm">Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
