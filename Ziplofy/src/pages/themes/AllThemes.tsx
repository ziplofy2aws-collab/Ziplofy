import {
  Visibility as EyeIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useThemes } from "../../contexts/themes.context";
import { useInstalledThemes } from "../../contexts/installed-themes.context";
import { useStore } from "../../contexts/store.context";
import { useCustomThemes } from "../../contexts/custom-themes.context";
import ThemePreviewModal from "../../components/ThemePreviewModal";
import ThemeEditChoiceModal from "../../components/ThemeEditChoiceModal";
import { axiosi } from "../../config/axios.config";
import {
  isThemeEditorStaticMode,
  THEME_EDITOR_DEV_ROUTE,
} from "../../config/theme-editor-static.config";
import "./AllThemes.css";

interface Theme {
  _id: string;
  name: string;
  description: string;
  category: string;
  thumbnailUrl: string;
}

type ThemesTab = "public" | "installed" | "custom";

const AllThemes: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ThemesTab>("public");
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    themeId: string;
    themeName: string;
    isInstalled?: boolean;
    isCustomTheme?: boolean;
  }>({
    isOpen: false,
    themeId: "",
    themeName: "",
    isInstalled: false,
    isCustomTheme: false,
  });
  const [editChoice, setEditChoice] = useState<{ isOpen: boolean; themeId: string; isInstalled?: boolean; isCustomTheme?: boolean }>({
    isOpen: false,
    themeId: "",
    isInstalled: false,
    isCustomTheme: false,
  });
  const { themes, loading: themesLoading, error: themesError, fetchAll } = useThemes();
  const {
    installedThemes,
    installingThemeId,
    applyingThemeId,
    installTheme,
    applyTheme,
    uninstallTheme,
    fetchByStoreId,
  } = useInstalledThemes();
  const { activeStoreId, stores, setStores } = useStore();
  const appliedThemeId = useMemo(() => {
    const store = stores.find((s) => s._id === activeStoreId);
    if (!store?.appliedTheme) return null;
    return String(store.appliedTheme);
  }, [stores, activeStoreId]);
  const { customThemes, loading: customThemesLoading, fetchAll: fetchCustomThemes, deleteTheme: deleteCustomTheme, installTheme: installCustomTheme, uninstallTheme: uninstallCustomTheme, updateTheme } = useCustomThemes();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [thumbnailUpdateModal, setThumbnailUpdateModal] = useState<{
    isOpen: boolean;
    themeId: string;
    themeName: string;
  }>({
    isOpen: false,
    themeId: "",
    themeName: "",
  });
  const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<Record<string, string>>({});

  const handleUninstall = async (installedThemeId: string) => {
    await uninstallTheme(installedThemeId);
  };

  const handleInstallClick = async (themeId: string) => {
    if (!activeStoreId) return;
    await installTheme(activeStoreId, themeId);
  };

  const handlePreviewClick = (themeId: string, themeName: string, isInstalled: boolean = false, isCustomTheme: boolean = false) => {
    setPreviewModal({
      isOpen: true,
      themeId,
      themeName,
      isInstalled,
      isCustomTheme,
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      themeId: "",
      themeName: "",
      isInstalled: false,
      isCustomTheme: false,
    });
  };

  // Resolve installed theme URL - prioritizes store-specific, then user-specific, then default
  const resolveInstalledThemeUrl = (themeId: string): string => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const cacheBuster = `?v=${Date.now()}`;
    
    // Get userId from JWT token if available
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
    
    // Priority 1: Store-specific installed theme (if activeStoreId is available)
    if (activeStoreId) {
      return `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
    }
    
    // Priority 2: User-specific installed theme (if userId is available)
    if (userId) {
      return `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
    }
    
    // Priority 3: Fall back to default preview
    return `${apiBase}/themes/preview/${themeId}${cacheBuster}`;
  };

  const handleOpenTheme = (themeId: string, isCustomTheme: boolean = false) => {
    let themeUrl: string;
    if (isCustomTheme) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const cacheBuster = `?v=${Date.now()}`;
      
      // Check if it's in installed format (custom-{customThemeId})
      if (themeId.startsWith('custom-')) {
        // For installed custom themes, use the installed theme endpoint
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
        
        // Priority 1: Store-specific installed theme (if activeStoreId is available)
        if (activeStoreId) {
          themeUrl = `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
        } else if (userId) {
          // Priority 2: User-specific installed theme
          themeUrl = `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
        } else {
          // Fallback: try to extract actual custom theme ID
          const actualCustomThemeId = themeId.replace(/^custom-/, '');
          themeUrl = `${apiBase}/custom-themes/${actualCustomThemeId}/files/index.html${cacheBuster}`;
        }
      } else {
        // Direct custom theme (not installed), use custom theme file serving route
        themeUrl = `${apiBase}/custom-themes/${themeId}/files/index.html${cacheBuster}`;
      }
    } else {
      themeUrl = resolveInstalledThemeUrl(themeId);
    }
    window.open(themeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEditTheme = (themeId: string, isInstalled: boolean = false, isCustomTheme: boolean = false) => {
    if (isCustomTheme) {
      setEditChoice({ isOpen: true, themeId, isInstalled, isCustomTheme });
      return;
    }
    // Catalog themes (schema / manifest / default-config editor)
    navigate(`/themes/${themeId}/editor`);
  };

  // Handle thumbnail update
  const handleUpdateThumbnail = async (themeId: string, thumbnailFile: File) => {
    setUploadingThumbnail(true);
    let previewUrl: string | null = null;
    
    try {
      // Create a preview URL for immediate UI update
      previewUrl = URL.createObjectURL(thumbnailFile);
      
      // Update local preview state immediately for instant UI feedback
      setThumbnailPreviews(prev => ({
        ...prev,
        [themeId]: previewUrl!
      }));
      
      // Fetch current theme data using authenticated axios
      const response = await axiosi.get(`/custom-themes/${themeId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Theme not found');
      }
      
      const theme = response.data.data;
      
      // Convert file to blob
      const thumbnailBlob = new Blob([thumbnailFile], { type: thumbnailFile.type });
      
      // Update theme with new thumbnail
      const updated = await updateTheme(themeId, theme.name, theme.html || '', theme.css || '', thumbnailBlob);
      
      if (updated) {
        // Force refresh the custom themes list with cache buster
        await fetchCustomThemes();
        
        // Wait a bit for the server to process the thumbnail
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("this is the domain section");
        
        // Remove preview after server thumbnail is loaded
        setTimeout(() => {
          setThumbnailPreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[themeId];
            return newPreviews;
          });
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
        }, 1000);
        
        setThumbnailUpdateModal({ isOpen: false, themeId: "", themeName: "" });
        setOpenMenuId(null);
      } else {
        // Remove preview on error
        setThumbnailPreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[themeId];
          return newPreviews;
        });
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        alert('Failed to update thumbnail. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating thumbnail:', error);
      // Remove preview on error
      setThumbnailPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[themeId];
        return newPreviews;
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update thumbnail. Please try again.';
      alert(errorMessage);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Handle file input change for thumbnail
  const handleThumbnailFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }
    
    // Update thumbnail
    if (thumbnailUpdateModal.themeId) {
      handleUpdateThumbnail(thumbnailUpdateModal.themeId, file);
    }
    
    // Reset input
    event.target.value = '';
  };

  // Delete custom theme
  const handleDeleteCustomTheme = async (themeId: string) => {
    // Validate that the theme ID is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(themeId);
    if (!isValidObjectId) {
      alert('Invalid theme ID. This theme may have been created with an old format. It cannot be deleted through the API.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this theme? This action cannot be undone.')) {
      return;
    }

    const success = await deleteCustomTheme(themeId);
    if (success) {
      // If this was the applied theme, clear it
      const appliedThemeId = localStorage.getItem('codiic.appliedCustomThemeId');
      if (appliedThemeId === themeId) {
        localStorage.removeItem('codiic.appliedCustomThemeId');
      }
    } else {
      alert('Failed to delete theme. Please try again.');
    }
  };

  // Check if a theme is installed
  const isThemeInstalled = (themeId: string) => {
    return installedThemes.some(installedTheme => installedTheme._id === themeId);
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchByStoreId]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.theme-card-menu')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  // Clear previews when themes are refreshed from server
  useEffect(() => {
    // Keep previews only for themes that are still being uploaded
    // This ensures server thumbnails are shown after upload completes
    if (customThemes.length > 0 && Object.keys(thumbnailPreviews).length > 0) {
      // Don't clear immediately - let the timeout in handleUpdateThumbnail handle it
      // This allows smooth transition from preview to server thumbnail
    }
  }, [customThemes]);

  // Load custom themes from API
  useEffect(() => {
    fetchCustomThemes();
    
    // Clean up invalid theme IDs from localStorage
    const appliedThemeId = localStorage.getItem('codiic.appliedCustomThemeId');
    if (appliedThemeId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(appliedThemeId);
      if (!isValidObjectId) {
        // Remove invalid ID (likely old UUID format from localStorage)
        localStorage.removeItem('codiic.appliedCustomThemeId');
        console.warn('Removed invalid custom theme ID from localStorage');
      }
    }
  }, [fetchCustomThemes]);

  const filteredThemes = themes.filter(
    (theme) =>
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theme.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const q = searchTerm.trim().toLowerCase();
  const installedForStore = installedThemes.filter((it: any) => {
    if (!q) return true;
    const name = String(it.name || it.themeName || '').toLowerCase();
    return name.includes(q);
  });
  const filteredCustomThemes = customThemes.filter((ct: any) => {
    if (!q) return true;
    return String(ct.name || '').toLowerCase().includes(q);
  });

  const tabs: { id: ThemesTab; label: string; count: number }[] = [
    { id: 'public', label: 'Public themes', count: filteredThemes.length },
    { id: 'installed', label: 'Installed', count: installedForStore.length },
    { id: 'custom', label: 'Custom themes', count: filteredCustomThemes.length },
  ];

  return (
    <div className="w-full space-y-5 pb-8">
      {isThemeEditorStaticMode() ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-amber-950">Static theme editor (dev mode)</p>
            <p className="mt-0.5 text-xs text-amber-900/80">
              Preview and edit the local reference theme without installing.
            </p>
          </div>
          <Link
            to={THEME_EDITOR_DEV_ROUTE}
            className="shrink-0 rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            Open dev editor
          </Link>
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Themes</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your storefront look and feel.</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:max-w-xl sm:justify-end lg:max-w-2xl">
          <div className="relative min-w-[160px] flex-1 sm:max-w-xs">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search themes…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              className={`rounded-md px-2.5 py-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className={`rounded-md px-2.5 py-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <Bars3Icon className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <Link
            to="/themes/create"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" aria-hidden />
            Create theme
          </Link>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-2 pt-2 sm:px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-700'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 tabular-nums ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {activeTab === 'installed' && (
            <>
              {installedForStore.length > 0 ? (
                <div className={`themes-layout ${viewMode}`}>
                  {installedForStore.map((it: any) => {
                    const t = it;
                    const isCustomTheme = Boolean(t.isCustomTheme || t._id?.startsWith('custom-'));
                    const actualThemeId = isCustomTheme && t.customThemeId ? t.customThemeId : t._id;
                    const themeIdForApply = isCustomTheme ? actualThemeId : t._id;
                    const isApplied =
                      appliedThemeId != null && String(appliedThemeId) === String(themeIdForApply);

                    return (
                      <div key={it._id} className="theme-card">
                        <div className="theme-thumbnail">
                          {t.thumbnailUrl ? (
                            <img
                              src={t.thumbnailUrl}
                              alt={t.name || ''}
                              className="theme-image"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="150" y="100" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="14">No Preview</text></svg>';
                              }}
                            />
                          ) : (
                            <div className="theme-image-placeholder">
                              <span>No Preview</span>
                            </div>
                          )}
                          <div className="theme-overlay">
                            <button
                              className="overlay-btn preview-btn"
                              onClick={() => handlePreviewClick(t._id, t.name, true, isCustomTheme)}
                            >
                              <EyeIcon fontSize="small" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>

                        <div className="theme-info">
                          <div className="theme-header-info">
                            <h3 className="theme-name">{t.name}</h3>
                            {isApplied ? (
                              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                Live
                              </span>
                            ) : null}
                          </div>

                          <div className="theme-actions">
                            <button
                              className="action-btn primary"
                              onClick={() => handleOpenTheme(t._id, isCustomTheme)}
                            >
                              Open
                            </button>
                            {isApplied ? (
                              <button type="button" className="action-btn installed" disabled>
                                Applied
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="action-btn secondary"
                                disabled={String(applyingThemeId) === String(themeIdForApply)}
                                onClick={async () => {
                                  if (!activeStoreId) {
                                    alert('Please select a store first.');
                                    return;
                                  }
                                  const ok = await applyTheme(activeStoreId, themeIdForApply, t.name);
                                  if (ok) {
                                    setStores((prev) =>
                                      prev.map((s) =>
                                        s._id === activeStoreId
                                          ? {
                                              ...s,
                                              appliedTheme: themeIdForApply,
                                              appliedCustomThemeId: null,
                                            }
                                          : s
                                      )
                                    );
                                  }
                                }}
                              >
                                {String(applyingThemeId) === String(themeIdForApply)
                                  ? 'Applying…'
                                  : 'Apply'}
                              </button>
                            )}
                            <button
                              className="action-btn secondary"
                              onClick={() => {
                                if (isCustomTheme) {
                                  if (actualThemeId) handleEditTheme(actualThemeId, false, true);
                                } else {
                                  handleEditTheme(t._id, true);
                                }
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn secondary"
                              onClick={
                                isCustomTheme
                                  ? async () => {
                                      if (!activeStoreId) {
                                        alert('Please select a store first.');
                                        return;
                                      }
                                      const success = await uninstallCustomTheme(
                                        actualThemeId,
                                        activeStoreId
                                      );
                                      if (success) await fetchByStoreId(activeStoreId);
                                    }
                                  : () => handleUninstall(it.installedThemeId)
                              }
                            >
                              Uninstall
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500">
                  No themes installed yet. Browse Public themes to install one.
                </div>
              )}
            </>
          )}


          {activeTab === 'custom' && (
            <>
              {customThemesLoading ? (
                <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 py-10">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
                    aria-hidden
                  />
                  <p className="text-sm text-gray-500">Loading…</p>
                </div>
              ) : filteredCustomThemes.length === 0 ? (
                <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">No custom themes yet.</p>
                  <Link
                    to="/themes/create"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create a theme
                  </Link>
                </div>
              ) : (
                <div className={`themes-layout ${viewMode}`}>
                  {filteredCustomThemes.map((ct) => {
                    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(ct._id);
                    const isInstalled = installedThemes.some((it: any) => {
                      const isCustomTheme = it.isCustomTheme || it._id?.startsWith('custom-');
                      const actualThemeId =
                        isCustomTheme && it.customThemeId ? it.customThemeId : null;
                      return isCustomTheme && actualThemeId === ct._id;
                    });

                    return (
                      <div key={ct._id} className="theme-card" style={{ position: 'relative' }}>
                        {isValidObjectId && (
                          <div className="theme-card-menu">
                            <button
                              className="theme-card-menu-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === ct._id ? null : ct._id);
                              }}
                              aria-label="Theme options"
                            >
                              <MoreVertIcon fontSize="small" />
                            </button>
                            {openMenuId === ct._id && (
                              <>
                                <div
                                  className="theme-card-menu-overlay"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="theme-card-menu-dropdown">
                                  <button
                                    className="theme-card-menu-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setThumbnailUpdateModal({
                                        isOpen: true,
                                        themeId: ct._id,
                                        themeName: ct.name,
                                      });
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <ImageIcon fontSize="small" style={{ marginRight: '8px' }} />
                                    Update Thumbnail
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        <div className="theme-thumbnail">
                          {(() => {
                            const previewUrl = thumbnailPreviews[ct._id];
                            const serverThumbnailUrl = (ct as any).thumbnailUrl;
                            const thumbnailUrl =
                              previewUrl ||
                              (serverThumbnailUrl
                                ? `${serverThumbnailUrl}${serverThumbnailUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
                                : null);

                            return thumbnailUrl ? (
                              <img
                                key={`${ct._id}-${previewUrl ? 'preview' : 'server'}`}
                                src={thumbnailUrl}
                                alt={ct.name || ''}
                                className="theme-image"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  e.currentTarget.style.display = 'none';
                                  const placeholder = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null;
                          })()}
                          <div
                            className="theme-image-placeholder"
                            style={{
                              display:
                                thumbnailPreviews[ct._id] || (ct as any).thumbnailUrl
                                  ? 'none'
                                  : 'flex',
                            }}
                          >
                            <span>{ct.name}</span>
                          </div>
                          {isValidObjectId && (
                            <div className="theme-overlay">
                              <button
                                className="overlay-btn preview-btn"
                                onClick={() => handlePreviewClick(ct._id, ct.name, false, true)}
                              >
                                <EyeIcon fontSize="small" />
                                <span>Preview</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="theme-info">
                          <div className="theme-header-info">
                            <h3 className="theme-name">{ct.name}</h3>
                            {(ct as any).status === 'draft' ? (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                Draft
                              </span>
                            ) : null}
                          </div>
                          <div className="theme-actions">
                            <button
                              className="action-btn primary"
                              onClick={() => {
                                if (!isValidObjectId) {
                                  alert(
                                    'Invalid theme ID. This theme may have been created with an old format. Please delete and recreate it.'
                                  );
                                  return;
                                }
                                handleEditTheme(ct._id, false, true);
                              }}
                            >
                              Edit
                            </button>
                            {isInstalled ? (
                              <button className="action-btn installed" disabled>
                                Installed
                              </button>
                            ) : (
                              <button
                                className="action-btn secondary"
                                onClick={async () => {
                                  if (!isValidObjectId) {
                                    alert('Invalid theme ID. Please recreate this theme.');
                                    return;
                                  }
                                  if (!activeStoreId) {
                                    alert('Please select a store first.');
                                    return;
                                  }
                                  const success = await installCustomTheme(ct._id, activeStoreId);
                                  if (success) {
                                    await new Promise((resolve) => setTimeout(resolve, 500));
                                    await fetchByStoreId(activeStoreId);
                                  }
                                }}
                              >
                                Apply
                              </button>
                            )}
                            <button
                              className="action-btn secondary"
                              onClick={() => handleDeleteCustomTheme(ct._id)}
                            >
                              <DeleteIcon fontSize="small" style={{ marginRight: 4 }} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'public' && (
            <>
              <div className={`themes-layout ${viewMode}`}>
                {themesLoading && (
                  <div className="col-span-full flex min-h-[160px] flex-col items-center justify-center gap-3 py-12">
                    <div
                      className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
                      aria-hidden
                    />
                    <p className="text-sm text-gray-500">Loading public themes…</p>
                  </div>
                )}
                {themesError && (
                  <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <p className="font-medium">Could not load themes</p>
                    <p className="mt-0.5">{themesError}</p>
                  </div>
                )}
                {filteredThemes.map((theme) => (
                  <div key={theme._id} className="theme-card">
                    <div className="theme-thumbnail">
                      <img
                        src={theme.thumbnailUrl || ''}
                        alt={theme.name}
                        className="theme-image"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="150" y="100" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="14">No Preview</text></svg>';
                        }}
                      />
                      <div className="theme-overlay">
                        <button
                          className="overlay-btn preview-btn"
                          onClick={() => handlePreviewClick(theme._id, theme.name)}
                        >
                          <EyeIcon fontSize="small" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>

                    <div className="theme-info">
                      <div className="theme-header-info">
                        <h3 className="theme-name">{theme.name}</h3>
                      </div>
                      {theme.description ? (
                        <p className="theme-description">{theme.description}</p>
                      ) : null}
                      <div className="theme-actions">
                        {isThemeInstalled(theme._id) ? (
                          <button className="action-btn installed" disabled>
                            Installed
                          </button>
                        ) : (
                          <button
                            className="action-btn primary"
                            disabled={String(installingThemeId) === String(theme._id)}
                            onClick={() => handleInstallClick(theme._id)}
                          >
                            {String(installingThemeId) === String(theme._id)
                              ? 'Installing…'
                              : 'Install'}
                          </button>
                        )}
                        <button
                          className="action-btn secondary"
                          onClick={() => handlePreviewClick(theme._id, theme.name)}
                        >
                          Preview
                        </button>
                        {isThemeInstalled(theme._id) ? (
                          <button
                            className="action-btn secondary"
                            onClick={() => handleEditTheme(theme._id, true)}
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!themesLoading && !themesError && filteredThemes.length === 0 && (
                <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">No public themes match your search.</p>
                  {searchTerm ? (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ThemePreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        themeId={previewModal.themeId}
        themeName={previewModal.themeName}
        isInstalled={previewModal.isInstalled}
        isCustomTheme={previewModal.isCustomTheme}
      />
      <ThemeEditChoiceModal
        isOpen={editChoice.isOpen}
        onClose={() =>
          setEditChoice({ isOpen: false, themeId: '', isInstalled: false, isCustomTheme: false })
        }
        themeId={editChoice.themeId}
        isCustomTheme={editChoice.isCustomTheme}
      />

      {thumbnailUpdateModal.isOpen && (
        <div
          className="thumbnail-update-modal-overlay"
          onClick={() =>
            !uploadingThumbnail &&
            setThumbnailUpdateModal({ isOpen: false, themeId: '', themeName: '' })
          }
        >
          <div className="thumbnail-update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="thumbnail-update-modal-header">
              <h2>Update Thumbnail</h2>
              <button
                className="thumbnail-update-modal-close"
                onClick={() =>
                  !uploadingThumbnail &&
                  setThumbnailUpdateModal({ isOpen: false, themeId: '', themeName: '' })
                }
                disabled={uploadingThumbnail}
              >
                ×
              </button>
            </div>
            <div className="thumbnail-update-modal-content">
              <p>
                Select an image to update the thumbnail for{' '}
                <strong>{thumbnailUpdateModal.themeName}</strong>
              </p>
              <div className="thumbnail-update-modal-upload">
                <input
                  type="file"
                  id="thumbnail-upload-input"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  disabled={uploadingThumbnail}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="thumbnail-upload-input"
                  className={`thumbnail-upload-label ${uploadingThumbnail ? 'disabled' : ''}`}
                >
                  {uploadingThumbnail ? (
                    <>
                      <div className="thumbnail-upload-spinner"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon fontSize="large" />
                      <span>Choose Image</span>
                      <span className="thumbnail-upload-hint">PNG, JPG, or GIF (max 5MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllThemes;
