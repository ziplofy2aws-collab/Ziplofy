'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CreateThemePage = dynamic(
  () => import('@/create-theme/CreateThemePage'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[1310] flex items-center justify-center bg-white">
        <p className="text-sm text-neutral-500">Loading theme builder…</p>
      </div>
    ),
  }
);

export default function ClientCreateThemePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[1310] flex items-center justify-center bg-white">
          <p className="text-sm text-neutral-500">Loading theme builder…</p>
        </div>
      }
    >
      <CreateThemePage />
    </Suspense>
  );
}
