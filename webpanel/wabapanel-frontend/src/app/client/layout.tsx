'use client';
import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useRouter } from 'next/navigation';
import ClientSidebar from '@/components/layout/ClientSidebar';
import Header from '@/components/layout/Header';
import CallProvider from '@/contexts/CallProvider';
import { I18nProvider } from '@/lib/i18n';
import PageHelp from '@/components/PageHelp';
import NotificationProvider from '@/components/NotificationProvider';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { useAuthStore } from '@/stores/authStore';
import { useStoreStore } from '@/stores/storeStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, loadUser, user } = useAuthStore();
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const [maintenance, setMaintenance] = useState<{ isEnabled: boolean; message: string } | null>(null);

  const isInformaticThemeEditor =
    pathname === '/client/themes/informatic-editor' ||
    Boolean(pathname?.startsWith('/client/themes/informatic-editor/'));

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Keep active store in global Zustand so the whole client area can adapt.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const role = (user as unknown as { role?: string })?.role;
    if (role === 'vendor') {
      void fetchStores();
    }
  }, [isLoading, isAuthenticated, user, fetchStores]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      try { sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search); } catch { /* */ }
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    const r = (user as unknown as { role?: string })?.role;
    if (r === 'admin' || r === 'super_admin') {
      router.replace('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://api.wabapanel.com/api').replace(/\/api$/, '');
    fetch(apiBase + '/api/maintenance-status')
      .then(r => r.json())
      .then(d => setMaintenance(d.data || null))
      .catch(() => setMaintenance(null));
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  {
    const r = (user as unknown as { role?: string })?.role;
    if (r === 'admin' || r === 'super_admin') return null;
  }

  const role = (user as unknown as { role?: string })?.role;
  if (maintenance?.isEnabled && role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Under Maintenance</h2>
          <p className="text-gray-500">{maintenance.message || 'We are currently under maintenance. Please check back later.'}</p>
        </div>
      </div>
    );
  }

  // Fullscreen Informatic Theme Editor (third editor — no admin chrome)
  if (isInformaticThemeEditor) {
    return (
      <I18nProvider>
        <CallProvider>
          <NotificationProvider />
          {children}
        </CallProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
    <CallProvider>
      <NotificationProvider />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="flex h-screen flex-col overflow-hidden bg-page-background-color antialiased text-admin-text">
        <Header variant="shopify" />
        <div className="relative flex min-h-0 flex-1 pt-14">
          <ClientSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AnnouncementBanner />
            <main className="min-h-0 flex-1 overflow-y-auto bg-page-background-color p-4 sm:p-6 lg:p-8">{children}</main>
            <PageHelp />
          </div>
        </div>
      </div>
    </CallProvider>
    </I18nProvider>
  );
}
