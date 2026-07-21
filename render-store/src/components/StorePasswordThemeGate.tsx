import { useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { ThemeConfigProvider, useThemeConfig } from '@/contexts/theme-config.context';
import { shouldUseComposerRuntime } from '../utils/themeComposer';
import { useStorefront } from '../contexts/store.context';
import { ensurePasswordPageTemplateBlocks } from '../../../codiic/src/utils/password-page-preset.util';
import { StorePasswordGate } from './StorePasswordGate';

function ComposerPasswordPage() {
  const config = useThemeConfig();
  const patchedConfig = useMemo(() => {
    const next = JSON.parse(JSON.stringify(config ?? {})) as Record<string, unknown>;
    ensurePasswordPageTemplateBlocks(next);
    return next;
  }, [config]);

  return (
    <ThemeConfigProvider config={patchedConfig}>
      <MemoryRouter initialEntries={['/password']}>
        <CustomThemeTemplatePage
          templateId="password"
          fallbackSectionIds={['password_main', 'email_signup']}
        />
      </MemoryRouter>
    </ThemeConfigProvider>
  );
}

/**
 * When the store is password-protected, render the theme `password` template
 * (password form + email signup) for custom/composer themes; fallback to the
 * hard-coded gate for legacy remote themes.
 */
export function StorePasswordThemeGate() {
  const { isStoreCustomTheme, themeConfig, remoteThemeJsUrl } = useStorefront();

  const useComposer = shouldUseComposerRuntime({
    isStoreCustomTheme,
    themeConfig,
    remoteThemeJsUrl,
  });

  if (useComposer && themeConfig) {
    return <ComposerPasswordPage />;
  }

  return <StorePasswordGate />;
}
