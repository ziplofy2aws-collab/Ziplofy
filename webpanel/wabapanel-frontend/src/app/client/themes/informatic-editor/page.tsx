'use client';

import { Suspense } from 'react';
import InformaticThemeEditor from '@/components/informatic-theme-editor/InformaticThemeEditor';

function EditorFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-500">
      Loading Informatic theme editor…
    </div>
  );
}

export default function InformaticThemeEditorPage() {
  return (
    <Suspense fallback={<EditorFallback />}>
      <InformaticThemeEditor />
    </Suspense>
  );
}
