import "./index.css";
import { IsValidStorefront } from './isValidStorefront.tsx';
import { StorefrontProviders } from './StorefrontProviders.tsx';
import { ThemePreviewApp } from './theme-preview/ThemePreviewApp';

function App() {
  const isThemePreview =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/theme-preview' ||
      window.location.pathname.startsWith('/theme-preview/'));

  if (isThemePreview) {
    return <ThemePreviewApp />;
  }

  return (
    <StorefrontProviders>
      <IsValidStorefront />
    </StorefrontProviders>
  );
}

export default App;
