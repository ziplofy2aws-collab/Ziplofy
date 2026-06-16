import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreNotificationEmail } from '../../contexts/store-notification-email.context';

const VerifySenderEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const { verifySenderEmail, loading } = useStoreNotificationEmail();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification link is missing or invalid.');
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await verifySenderEmail(token);
        if (cancelled) return;
        setStatus('success');
        setMessage('Your sender email has been verified successfully.');
      } catch (error: any) {
        if (cancelled) return;
        setStatus('error');
        setMessage(error?.message || 'Unable to verify sender email.');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isPending = loading || status === 'idle';

  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-[640px] flex-col gap-6">
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Verify sender email</h1>

          {isPending ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              <span>Verifying your sender email...</span>
            </div>
          ) : null}

          {!isPending && status === 'success' ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-900">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-relaxed">{message}</p>
              </div>
              <Link
                to="/settings/notifications"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Back to notifications
              </Link>
            </div>
          ) : null}

          {!isPending && status === 'error' ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
                <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-relaxed">{message}</p>
              </div>
              <Link
                to="/settings/notifications"
                className="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
              >
                Back to notifications
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VerifySenderEmailPage;
