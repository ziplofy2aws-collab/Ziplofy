'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';
import AppStatusScreen from '@/components/status/AppStatusScreen';
import PageTransition from '@/components/transitions/PageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loadUser, isLoading } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { (() => { try { sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search); } catch { /* */ } router.push('/auth/login?local=1'); })(); return; }
    if (!isAuthenticated) { loadUser().then(() => setReady(true)).catch(() => router.push('/auth/login?local=1')); }
    else setReady(true);
  }, [isAuthenticated, loadUser, router]);

  useEffect(() => {
    if (ready && user && !['super_admin', 'admin'].includes(user.role)) {
      router.push('/client/dashboard');
    }
  }, [ready, user, router]);

  if (isLoading || !ready) {
    return <AppStatusScreen variant="loading" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isAdmin />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
