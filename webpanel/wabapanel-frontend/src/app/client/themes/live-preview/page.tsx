'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InformaticLivePreview } from '@/components/informatic-theme-editor/InformaticLivePreview';
import { loadCatalogInformaticThemePack } from '@/lib/informatic-theme/load-static-pack';

/** Read-only live preview for catalog themes without static demo files. */
export default function InformaticThemeLivePreviewPage() {
  const searchParams = useSearchParams();
  const catalogThemeId = searchParams.get('catalogThemeId')?.trim() || '';
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [themeName, setThemeName] = useState('Informatic theme');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!catalogThemeId) {
      setError('Missing catalogThemeId');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadCatalogInformaticThemePack(catalogThemeId)
      .then((pack) => {
        if (cancelled) return;
        setConfig(pack.config);
        setThemeName(pack.themeName || 'Informatic theme');
      })
      .catch((e) => {
        if (cancelled) return;
        setError((e as Error)?.message || 'Failed to load theme preview');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [catalogThemeId]);

  const pageTitle = useMemo(() => `${themeName} · Preview`, [themeName]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" aria-hidden />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-red-700">{error || 'Preview unavailable'}</p>
      </div>
    );
  }

  return (
    <InformaticLivePreview
      config={config}
      pageId="index"
      inspectorEnabled={false}
    />
  );
}
