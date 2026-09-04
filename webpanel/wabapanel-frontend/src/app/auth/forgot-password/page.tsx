'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AuthShell from '@/components/AuthShell';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={sent ? 'Check your email' : 'Reset password'}
      subtitle={
        sent
          ? `We sent a reset link to ${email}.`
          : 'Enter your email and we will send you a reset link.'
      }
      footer={
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-sm text-gray-500">If an account exists for that email, the link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="w-4 h-4" />} />
          <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
        </form>
      )}
    </AuthShell>
  );
}
