import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pre-boot logout handler: run before React mounts
(() => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('logout') === 'true') {
      window.localStorage.removeItem('accessToken');
      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.toString());
    }
  } catch {}
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);