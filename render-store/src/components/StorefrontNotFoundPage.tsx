import { useMemo } from 'react';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { ThemeConfigProvider, useThemeConfig } from '@/contexts/theme-config.context';
import { ensureNotFoundPageTemplateBlocks } from '../../../codiic/src/utils/not-found-page-preset.util';

const NOT_FOUND_FALLBACK_SECTIONS = ['not_found_main', 'featured_collection'] as const;

/**
 * Live storefront 404 — theme `404` template (message + featured collection).
 * Seeds missing sections so older saves still render.
 */
export function StorefrontNotFoundPage() {
  const config = useThemeConfig();
  const patchedConfig = useMemo(() => {
    const next = JSON.parse(JSON.stringify(config ?? {})) as Record<string, unknown>;
    ensureNotFoundPageTemplateBlocks(next);
    return next;
  }, [config]);

  return (
    <ThemeConfigProvider config={patchedConfig}>
      <CustomThemeTemplatePage
        templateId="404"
        fallbackSectionIds={[...NOT_FOUND_FALLBACK_SECTIONS]}
      />
    </ThemeConfigProvider>
  );
}
