import { createContext, useCallback, useContext, useState } from 'react';

interface StorefrontSearchContextType {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const StorefrontSearchContext = createContext<StorefrontSearchContextType | undefined>(undefined);

export function StorefrontSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchValue, setSearchValue] = useState('');

  const setValue = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <StorefrontSearchContext.Provider value={{ searchValue, setSearchValue: setValue }}>
      {children}
    </StorefrontSearchContext.Provider>
  );
}

export function useStorefrontSearch() {
  const ctx = useContext(StorefrontSearchContext);
  if (!ctx) {
    return {
      searchValue: '',
      setSearchValue: () => {},
    };
  }
  return ctx;
}
