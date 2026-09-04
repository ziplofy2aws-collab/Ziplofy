'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AuthShell from '@/components/AuthShell';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successful!');
      router.push('/auth/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="New Password" type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<Lock className="w-4 h-4" />} />
      <Input label="Confirm Password" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required icon={<Lock className="w-4 h-4" />} />
      <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password for your account.">
      <Suspense fallback={<div className="text-center py-4 text-sm text-gray-400">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
