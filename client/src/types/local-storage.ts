export type LocalStorageKey = 'accessToken' | 'user'

// Type-safe localStorage wrapper
export const safeLocalStorage = {
  getItem: (key: LocalStorageKey): string | null => {
    return localStorage.getItem(key);
  },
  
  setItem: (key: LocalStorageKey, value: string): void => {
    localStorage.setItem(key, value);
  },
  
  removeItem: (key: LocalStorageKey): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
};

// Advanced typed localStorage (for future use)
export const typedLocalStorage = {
  getItem: (key: LocalStorageKey): string | null => {
    return localStorage.getItem(key);
  },
  
  setItem: (key: LocalStorageKey, value: string): void => {
    localStorage.setItem(key, value);
  },
  
  removeItem: (key: LocalStorageKey): void => {
    localStorage.removeItem(key);
  }
};