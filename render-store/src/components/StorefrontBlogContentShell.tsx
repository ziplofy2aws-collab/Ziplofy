import type { ReactNode } from 'react';
import { CustomThemePageShell } from '@codiic/create-theme/runtime';
import { useStorefront } from '@/contexts/store.context';
import { useLoadedThemeContract } from '@/themes/RemoteThemeProvider.tsx';

type Props = {
  children: ReactNode;
};

/** Wraps blog pages with the store header/footer (custom or remote theme). */
export function StorefrontBlogContentShell({ children }: Props) {
  const { isStoreCustomTheme } = useStorefront();

  if (isStoreCustomTheme) {
    return <CustomThemePageShell>{children}</CustomThemePageShell>;
  }

  return <RemoteThemeBlogShell>{children}</RemoteThemeBlogShell>;
}

function RemoteThemeBlogShell({ children }: Props) {
  const theme = useLoadedThemeContract();
  const Header = theme.Header;
  const Footer = theme.Footer;

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
