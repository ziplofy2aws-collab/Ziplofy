import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

export interface CustomThemeItem {
  _id: string;
  name: string;
  html: string;
  css: string;
  themePath: string;
  status?: 'draft' | 'published';
  createdBy: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FetchCustomThemesResponse {
  success: boolean;
  data: CustomThemeItem[];
  count: number;
}

interface CreateCustomThemeResponse {
  success: boolean;
  data: CustomThemeItem;
  message: string;
}

interface CustomThemesContextType {
  customThemes: CustomThemeItem[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  createTheme: (name: string, html: string, css: string, thumbnail?: Blob, status?: 'draft' | 'published') => Promise<CustomThemeItem | null>;
  updateTheme: (id: string, name: string, html: string, css: string, thumbnail?: Blob, status?: 'draft' | 'published') => Promise<CustomThemeItem | null>;
  deleteTheme: (id: string) => Promise<boolean>;
  installTheme: (customThemeId: string, storeId: string) => Promise<boolean>;
  uninstallTheme: (customThemeId: string, storeId: string) => Promise<boolean>;
}

const CustomThemesContext = createContext<CustomThemesContextType | undefined>(undefined);

export const CustomThemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customThemes, setCustomThemes] = useState<CustomThemeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<FetchCustomThemesResponse>('/custom-themes');
      if (data.success) {
        // Show all themes returned by the API - backend is the source of truth
        setCustomThemes(data.data || []);
      } else {
        setCustomThemes([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch custom themes');
      setCustomThemes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTheme = useCallback(async (name: string, html: string, css: string, thumbnail?: Blob, status?: 'draft' | 'published'): Promise<CustomThemeItem | null> => {
    setLoading(true);
    setError(null);
    try {
      // Create zip file from HTML and CSS
      const zip = new JSZip();
      zip.file('index.html', html);
      if (css) {
        zip.file('style.css', css);
      }
      
      // Extract and include image files referenced in HTML
      const extractAndIncludeImages = async (htmlContent: string) => {
        const images: string[] = [];
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
        const srcsetRegex = /srcset=["']([^"']+)["']/gi;
        const bgImageRegex = /background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
        
        // Extract from img src
        let match;
        while ((match = imgRegex.exec(htmlContent)) !== null) {
          const src = match[1];
          if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('#') && !src.startsWith('mailto:')) {
            images.push(src);
          }
        }
        
        // Extract from srcset
        while ((match = srcsetRegex.exec(htmlContent)) !== null) {
          const srcset = match[1];
          srcset.split(',').forEach(entry => {
            const url = entry.trim().split(/\s+/)[0];
            if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('#')) {
              images.push(url);
            }
          });
        }
        
        // Extract from background-image
        while ((match = bgImageRegex.exec(htmlContent)) !== null) {
          const url = match[1];
          if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('#')) {
            images.push(url);
          }
        }
        
        // Remove duplicates and normalize paths
        const uniqueImages = [...new Set(images.map(img => {
          return img.startsWith('/') ? img.substring(1) : img;
        }))];
        
        // Fetch and include images (only if they're from the same origin or relative paths)
        const apiBase = import.meta.env.VITE_API_URL || window.location.origin + '/api';
        const buildAuthHeaders = (): Record<string, string> => {
          const headers: Record<string, string> = {};
          const token =
            localStorage.getItem('accessToken') ||
            sessionStorage.getItem('accessToken') ||
            localStorage.getItem('token') ||
            sessionStorage.getItem('token');
          if (token) headers.Authorization = `Bearer ${token}`;
          return headers;
        };
        
        for (const imgPath of uniqueImages) {
          try {
            // Try to fetch from current theme source if available
            // For now, we'll skip external images and only include if they're accessible
            // The server-side path rewriting will handle making them accessible
            console.log('📸 Image reference found:', imgPath);
          } catch (err) {
            console.warn('Failed to fetch image:', imgPath, err);
          }
        }
      };
      
      // Extract and include images (async but don't wait - images will be handled server-side)
      extractAndIncludeImages(html).catch(err => {
        console.warn('Error extracting images:', err);
      });
      
      // Generate zip file as blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('zipFile', zipBlob, `${name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail, 'thumbnail.png');
      }
      if (status) {
        formData.append('status', status);
      }
      
      const { data } = await axiosi.post<CreateCustomThemeResponse>('/custom-themes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes timeout for large theme uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      
      if (data.success) {
        await fetchAll(); // Refresh the list
        toast.success('Theme created successfully!');
        return data.data;
      }
      toast.error('Failed to create theme.');
      return null;
    } catch (err: any) {
      let errorMsg = 'Failed to create custom theme';
      
      // Handle specific error types
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        errorMsg = 'Upload timeout: The theme is very large. Please try again or reduce the theme size.';
      } else if (err?.response?.status === 413 || err?.message?.includes('File too large') || err?.message?.includes('MulterError')) {
        errorMsg = 'Theme too large: The theme exceeds the maximum size limit (500MB). Please reduce the theme size.';
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const updateTheme = useCallback(async (id: string, name: string, html: string, css: string, thumbnail?: Blob, status?: 'draft' | 'published'): Promise<CustomThemeItem | null> => {
    setLoading(true);
    setError(null);
    try {
      // Create zip file from HTML and CSS
      const zip = new JSZip();
      zip.file('index.html', html);
      if (css) {
        zip.file('style.css', css);
      }
      
      // Generate zip file as blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('zipFile', zipBlob, `${name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail, 'thumbnail.png');
      }
      if (status) {
        formData.append('status', status);
      }
      
      const { data } = await axiosi.put<CreateCustomThemeResponse>(`/custom-themes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes timeout for large theme uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      
      if (data.success) {
        await fetchAll(); // Refresh the list
        toast.success('Theme updated successfully!');
        return data.data;
      }
      toast.error('Failed to update theme.');
      return null;
    } catch (err: any) {
      // If theme not found (404), return null silently - caller will handle fallback to create
      if (err?.response?.status === 404) {
        console.warn('Theme not found (404) - updateTheme returning null for fallback handling');
        setError(null); // Clear error for 404 - it's expected when editing installed themes
        return null;
      }
      
      let errorMsg = 'Failed to update custom theme';
      
      // Handle specific error types
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        errorMsg = 'Upload timeout: The theme is very large. Please try again or reduce the theme size.';
      } else if (err?.response?.status === 413 || err?.message?.includes('File too large') || err?.message?.includes('MulterError')) {
        errorMsg = 'Theme too large: The theme exceeds the maximum size limit (500MB). Please reduce the theme size.';
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const deleteTheme = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.delete<{ success: boolean; message: string }>(`/custom-themes/${id}`);
      if (data.success) {
        await fetchAll(); // Refresh the list
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete custom theme');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const installTheme = useCallback(async (customThemeId: string, storeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Get userId from token
      const getUserIdFromToken = (): string | null => {
        try {
          const token = localStorage.getItem('accessToken') || 
                       sessionStorage.getItem('accessToken') ||
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('token');
          if (!token) return null;
          const parts = token.split('.');
          if (parts.length < 2) return null;
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          return String(payload.uid || payload.userId || payload.id || '');
        } catch {
          return null;
        }
      };

      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error('User authentication required');
      }

      const { data } = await axiosi.post('/custom-themes/install', {
        customThemeId,
        userId,
        storeId,
      });

      if (data.success) {
        // IMPORTANT: Clear any previously applied custom theme to ensure only one is active
        // The backend already deactivated all regular themes, so we just need to update localStorage
        const themeIdForStore = `custom-${customThemeId}`;
        localStorage.setItem('ziplofy.appliedCustomThemeId', themeIdForStore);
        localStorage.setItem('ziplofy.appliedCustomThemeStoreId', storeId);
        // Wait a moment for backend to complete cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
        // Toast notification removed per user request
        return true;
      }
      toast.error('Failed to install custom theme.');
      return false;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to install custom theme';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uninstallTheme = useCallback(async (customThemeId: string, storeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Get userId from token
      const getUserIdFromToken = (): string | null => {
        try {
          const token = localStorage.getItem('accessToken') || 
                       sessionStorage.getItem('accessToken') ||
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('token');
          if (!token) return null;
          const parts = token.split('.');
          if (parts.length < 2) return null;
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          return String(payload.uid || payload.userId || payload.id || '');
        } catch {
          return null;
        }
      };

      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error('User authentication required');
      }

      const { data } = await axiosi.post('/custom-themes/uninstall', {
        customThemeId,
        userId,
        storeId,
      });

      if (data.success) {
        // Clear custom theme from localStorage
        localStorage.removeItem('ziplofy.appliedCustomThemeId');
        localStorage.removeItem('ziplofy.appliedCustomThemeStoreId');
        // Toast notification removed per user request
        return true;
      }
      toast.error('Failed to uninstall custom theme.');
      return false;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to uninstall custom theme';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: CustomThemesContextType = useMemo(() => ({
    customThemes,
    loading,
    error,
    fetchAll,
    createTheme,
    updateTheme,
    deleteTheme,
    installTheme,
    uninstallTheme,
  }), [customThemes, loading, error, fetchAll, createTheme, updateTheme, deleteTheme, installTheme, uninstallTheme]);

  return (
    <CustomThemesContext.Provider value={value}>
      {children}
    </CustomThemesContext.Provider>
  );
};

export function useCustomThemes(): CustomThemesContextType {
  const ctx = useContext(CustomThemesContext);
  if (!ctx) throw new Error('useCustomThemes must be used within CustomThemesProvider');
  return ctx;
}

