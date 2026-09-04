import { StorefrontProvider } from '@/contexts/store.context';
import { IsValidStorefront } from '@/components/IsValidStorefront';

/**
 * Web Panel Store Renderer — Informatic site host.
 * Resolves store from Host / subdomain, then renders the applied theme (upcoming).
 */
function App() {
  return (
    <StorefrontProvider>
      <IsValidStorefront />
    </StorefrontProvider>
  );
}

export default App;
