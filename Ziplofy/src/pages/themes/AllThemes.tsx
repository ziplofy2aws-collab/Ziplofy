import {
  Visibility as EyeIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
  Bars3Icon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
  RectangleStackIcon,
  SparklesIcon,
  Squares2X2Icon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useThemes } from "../../contexts/themes.context";
import { useInstalledThemes } from "../../contexts/installed-themes.context";
import { useStore } from "../../contexts/store.context";
import { useCustomThemes } from "../../contexts/custom-themes.context";
import {
  useStoreCustomThemes,
  type StoreCustomTheme,
} from "../../contexts/store-custom-themes.context";
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

const ThemeSectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 border-b border-gray-100 bg-linear-to-r from-gray-50/90 to-white px-5 py-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
      <Icon className="h-5 w-5 text-blue-600" aria-hidden />
    </div>
    <div className="min-w-0 pt-0.5">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  </div>
);

const AllThemes: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
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
  const { activeStoreId, stores, setStores, applyStoreCustomTheme } = useStore();
  const appliedThemeId = useMemo(() => {
    const store = stores.find((s) => s._id === activeStoreId);
    if (!store?.appliedTheme) return null;
    return String(store.appliedTheme);
  }, [stores, activeStoreId]);
  const appliedStoreCustomThemeId = useMemo(() => {
    const store = stores.find((s) => s._id === activeStoreId);
    if (!store?.appliedCustomThemeId) return null;
    return String(store.appliedCustomThemeId);
  }, [stores, activeStoreId]);
  const [applyingStoreCustomThemeId, setApplyingStoreCustomThemeId] = useState<string | null>(null);
  const { customThemes, loading: customThemesLoading, fetchAll: fetchCustomThemes, deleteTheme: deleteCustomTheme, installTheme: installCustomTheme, uninstallTheme: uninstallCustomTheme, updateTheme } = useCustomThemes();
  const {
    themes: storeCustomThemes,
    loading: storeCustomThemesLoading,
    getByStoreId: fetchStoreCustomThemes,
    deleteTheme: deleteStoreCustomTheme,
  } = useStoreCustomThemes();
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
    if (isInstalled && !isCustomTheme) {
      navigate(`/themes/${themeId}/editor`);
      return;
    }
    setEditChoice({ isOpen: true, themeId, isInstalled, isCustomTheme });
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
      const appliedThemeId = localStorage.getItem('ziplofy.appliedCustomThemeId');
      if (appliedThemeId === themeId) {
        localStorage.removeItem('ziplofy.appliedCustomThemeId');
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

  useEffect(() => {
    if (!activeStoreId) return;
    fetchStoreCustomThemes(activeStoreId).catch(() => {
      /* errors surfaced via context */
    });
  }, [activeStoreId, fetchStoreCustomThemes]);

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
    const appliedThemeId = localStorage.getItem('ziplofy.appliedCustomThemeId');
    if (appliedThemeId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(appliedThemeId);
      if (!isValidObjectId) {
        // Remove invalid ID (likely old UUID format from localStorage)
        localStorage.removeItem('ziplofy.appliedCustomThemeId');
        console.warn('Removed invalid custom theme ID from localStorage');
      }
    }
  }, [fetchCustomThemes]);

  const filteredThemes = themes.filter(
    (theme) =>
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theme.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Total themes = sum of custom themes + marketplace themes
  const totalCount = customThemes.length + themes.length;
  const storeCustomThemesCount = storeCustomThemes.length;
  // Installed for selected store (regular + custom), resolved from InstalledThemes flow
  const installedForStore = installedThemes;
  const customDrafts = customThemes.filter((ct: any) => ct.status === 'draft');
  const filteredStoreCustomThemes = storeCustomThemes.filter((t) =>
    t.themeName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const showingCount =
    installedForStore.length +
    storeCustomThemes.length +
    customThemes.length +
    filteredThemes.length;

  const handleOpenStoreCustomTheme = (themeId: string) => {
    const url = new URL('/themes/create', window.location.origin);
    url.searchParams.set('id', themeId);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleInstallStoreCustomTheme = async (theme: StoreCustomTheme) => {
    if (!activeStoreId) {
      toast.error('Select a store before installing a theme');
      return;
    }
    try {
      setApplyingStoreCustomThemeId(theme._id);
      await applyStoreCustomTheme(activeStoreId, theme._id);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to install theme';
      toast.error(msg);
    } finally {
      setApplyingStoreCustomThemeId(null);
    }
  };

  const handleDeleteStoreCustomTheme = async (theme: StoreCustomTheme) => {
    if (
      !window.confirm(
        `Delete "${theme.themeName}"? This removes the saved theme design and cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteStoreCustomTheme(theme._id);
      if (activeStoreId) {
        await fetchStoreCustomThemes(activeStoreId);
      }
    } catch {
      /* toast from context / axios */
    }
  };

  const formatThemeDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {isThemeEditorStaticMode() ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-amber-950">Static theme editor (dev mode)</p>
            <p className="mt-0.5 text-xs text-amber-900/80">
              Production theme install / S3 flow is bypassed. One local reference theme is used for all editor work.
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
      <header className="rounded-2xl border border-gray-200/80 bg-linear-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Theme library</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                <PhotoIcon className="h-3.5 w-3.5" aria-hidden />
                {themes.length} templates
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Install storefront themes, preview demos, or build a custom theme in the editor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Squares2X2Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xl font-bold leading-tight text-gray-900">{totalCount}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <RectangleStackIcon className="h-5 w-5" aria-hidden />
              </div>
              <div className="themes-stat-card">
                <PlusIcon className="themes-stat-icon h-5 w-5" aria-hidden />
                <div>
                  <span className="themes-stat-value">{storeCustomThemesCount}</span>
                  <span className="themes-stat-label">CREATOR SAVES</span>
                </div>
              </div>
              <div className="themes-stat-card">
                <FunnelIcon className="themes-stat-icon h-5 w-5" style={{ transform: 'rotate(90deg)' }} aria-hidden />
                <div>
                  <span className="themes-stat-value">{showingCount}</span>
                  <span className="themes-stat-label">SHOWING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 hidden rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-2.5 sm:block">
          <p className="text-xs leading-relaxed text-blue-950/80">
            <span className="font-semibold text-blue-950">Tip:</span> use <strong>Install theme</strong> to install a
            template, then <strong>Edit</strong> to customize it for your brand.
          </p>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-linear-to-r from-gray-50/90 to-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Search & layout</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Find themes by name or description. Grid and list apply to every section below.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by name or description…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
          >
            <FunnelIcon className="h-4 w-4 text-gray-500" aria-hidden />
            <span>Filter</span>
          </button>
          <div className="flex shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/90 p-0.5">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-800'
              }`}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-800'
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
            className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" aria-hidden />
            <span>Create your own</span>
          </Link>
        </div>
      </div>

        {/* Installed Themes - Section 1 (store-installed themes) */}
        {Array.isArray(installedThemes) && (
          <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <ThemeSectionHeader
              icon={CheckCircleIcon}
              title="Installed themes"
              description="Themes currently installed for this store."
            />
            <div className="bg-gray-50/30 p-4 sm:p-5">
          {installedForStore.length > 0 ? (
          <div className={`themes-layout ${viewMode}`}>
            {installedForStore.map((it: any) => {
              const t = it; // The theme data is directly in it, not nested under themeId
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
                    {(t as any).rating?.average > 0 && (
                      <div className="theme-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} fontSize="inherit" className="star filled" />
                          ))}
                        </div>
                        <span className="rating-text">{Number((t as any).rating?.average).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {t.description && <p className="theme-description">{t.description}</p>}

                  <div className="theme-meta">
                    {t.category && <span className="theme-category">{t.category}</span>}
                    <span className="theme-price">Free</span>
                  </div>

                  <div className="theme-actions">
                    <button 
                      className="action-btn primary" 
                      onClick={() => handleOpenTheme(t._id, isCustomTheme)}
                    >
                      Open
                    </button>
                    {isApplied ? (
                      <button
                        type="button"
                        className="action-btn secondary"
                        disabled
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: '1px solid #16a34a',
                          cursor: 'not-allowed',
                          opacity: 0.9,
                        }}
                      >
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
                                  ? { ...s, appliedTheme: themeIdForApply }
                                  : s
                              )
                            );
                          }
                        }}
                      >
                        {String(applyingThemeId) === String(themeIdForApply)
                          ? 'Applying…'
                          : 'Apply theme'}
                      </button>
                    )}
                    {isCustomTheme ? (
                      <button 
                        className="action-btn secondary" 
                        onClick={() => {
                          if (actualThemeId) {
                            handleEditTheme(actualThemeId, false, true);
                          }
                        }}
                      >
                        Edit
                      </button>
                    ) : (
                    <button 
                      className="action-btn secondary" 
                      onClick={() => handleEditTheme(t._id, true)}
                    >
                      Edit
                    </button>
                    )}
                    <button 
                      className="action-btn secondary" 
                      onClick={isCustomTheme ? async () => {
                        if (!activeStoreId) {
                          alert('Please select a store first.');
                          return;
                        }
                        // Uninstall custom theme (deletes installation directory)
                        // Confirmation dialog and toast notification removed per user request
                        const success = await uninstallCustomTheme(actualThemeId, activeStoreId);
                        if (success) {
                          // Refresh the list
                          await fetchByStoreId(activeStoreId);
                        }
                      } : () => handleUninstall(it.installedThemeId)}
                    >
                      Uninstall
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>
          ) : (
            <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/80 px-4 py-6 text-sm text-gray-500">
              No themes installed for this store yet.
            </div>
          )}
            </div>
          </section>
        )}

        {/* Store custom themes — JSON theme creator saves */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <ThemeSectionHeader
            icon={SwatchIcon}
            title="Custom themes"
            description="Themes you saved from the theme creator — open to continue editing sections and settings."
          />
          <div className="bg-gray-50/30 p-4 sm:p-5">
            {!activeStoreId ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/90 px-6 py-10 text-center">
                <p className="text-sm font-medium text-gray-700">Select a store</p>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Choose a store from the header to load saved custom themes for that storefront.
                </p>
              </div>
            ) : storeCustomThemesLoading ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white/80 py-12">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
                  aria-hidden
                />
                <p className="text-sm font-medium text-gray-600">Loading custom themes…</p>
              </div>
            ) : filteredStoreCustomThemes.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/90 px-6 py-10 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-violet-400/10 blur-xl" aria-hidden />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <SwatchIcon className="h-7 w-7 text-violet-600" aria-hidden />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900">No saved custom themes</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Build a theme in the creator, add sections, then use Save to store it here.
                </p>
                <Link
                  to="/themes/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden />
                  Open theme creator
                </Link>
              </div>
            ) : (
              <div className={`themes-layout ${viewMode}`}>
                {filteredStoreCustomThemes.map((theme) => {
                  const isApplied =
                    appliedStoreCustomThemeId != null &&
                    String(appliedStoreCustomThemeId) === String(theme._id);
                  const isApplying = applyingStoreCustomThemeId === theme._id;

                  return (
                  <div key={theme._id} className="theme-card">
                    <div className="theme-thumbnail">
                      <div className="theme-image-placeholder flex flex-col items-center justify-center gap-2 bg-linear-to-br from-violet-50 to-blue-50 px-4 text-center">
                        <SwatchIcon className="h-10 w-10 text-violet-500/80" aria-hidden />
                        <span className="text-xs font-medium text-violet-900/70">Theme creator</span>
                      </div>
                    </div>
                    <div className="theme-info">
                      <div className="theme-header-info">
                        <h3 className="theme-name">{theme.themeName}</h3>
                        {formatThemeDate(theme.updatedAt || theme.createdAt) ? (
                          <span className="text-[11px] font-medium text-gray-500">
                            Updated {formatThemeDate(theme.updatedAt || theme.createdAt)}
                          </span>
                        ) : null}
                      </div>
                      <p className="theme-description line-clamp-2">
                        JSON theme layout saved for this store. Open to edit sections and settings.
                      </p>
                      <div className="theme-actions">
                        <button
                          type="button"
                          className="action-btn primary"
                          onClick={() => handleOpenStoreCustomTheme(theme._id)}
                        >
                          Open
                        </button>
                        {isApplied ? (
                          <button
                            type="button"
                            className="action-btn secondary"
                            disabled
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: '1px solid #16a34a',
                              cursor: 'not-allowed',
                              opacity: 0.9,
                            }}
                          >
                            Installed
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="action-btn secondary"
                            disabled={isApplying || !activeStoreId}
                            onClick={() => handleInstallStoreCustomTheme(theme)}
                          >
                            {isApplying ? 'Installing…' : 'Install theme'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="action-btn secondary"
                          onClick={() => handleDeleteStoreCustomTheme(theme)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: '1px solid #dc2626',
                          }}
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
          </div>
        </section>

      {/* Drafts - themes saved but not yet published */}
      {customDrafts.length > 0 && (
        <React.Fragment>
          <div className="themes-section-divider">
            <h2 className="themes-section-title">Drafts</h2>
          </div>
          <p className="themes-section-subtitle" style={{ marginBottom: 16, marginTop: 8, color: '#6b7280', fontSize: 14 }}>
            Themes you&apos;ve saved. Publish when ready to use.
          </p>
          <div className={`themes-layout ${viewMode} themes-section-body`}>
            {customDrafts.map((ct) => {
              const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(ct._id);
              const previewUrl = thumbnailPreviews[ct._id];
              const serverThumbnailUrl = (ct as any).thumbnailUrl;
              const thumbnailUrl = previewUrl || (serverThumbnailUrl ? `${serverThumbnailUrl}${serverThumbnailUrl.includes('?') ? '&' : '?'}v=${Date.now()}` : null);
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
                          <div className="theme-card-menu-overlay" onClick={() => setOpenMenuId(null)} />
                          <div className="theme-card-menu-dropdown">
                            <button
                              className="theme-card-menu-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setThumbnailUpdateModal({ isOpen: true, themeId: ct._id, themeName: ct.name });
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
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={ct.name || ''}
                        className="theme-image"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.style.display = 'none';
                          const ph = e.currentTarget.nextElementSibling as HTMLElement;
                          if (ph) ph.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="theme-image-placeholder" style={{ display: thumbnailUrl ? 'none' : 'flex' }}>
                      <span>{ct.name}</span>
                    </div>
                    {isValidObjectId && (
                      <div className="theme-overlay">
                        <button className="overlay-btn preview-btn" onClick={() => handlePreviewClick(ct._id, ct.name, false, true)}>
                          <EyeIcon fontSize="small" />
                          <span>Preview</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="theme-info">
                    <div className="theme-header-info">
                      <h3 className="theme-name">{ct.name}</h3>
                      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Draft</span>
                    </div>
                    <div className="theme-actions">
                      <button className="action-btn primary" onClick={() => handleEditTheme(ct._id, false, true)}>
                        Edit
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleDeleteCustomTheme(ct._id)}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: '1px solid #dc2626' }}
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
        </React.Fragment>
      )}

        {/* Custom themes — Your creations (always show for orientation) */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <ThemeSectionHeader
            icon={SparklesIcon}
            title="Your creations"
            description="Themes you build in the editor — apply to your store, update thumbnails, or remove drafts."
          />
          <div className="bg-gray-50/30 p-4 sm:p-5">
            {customThemesLoading ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white/80 py-12">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
                  aria-hidden
                />
                <p className="text-sm font-medium text-gray-600">Loading your themes…</p>
              </div>
            ) : customThemes.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/90 px-6 py-12 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-xl" aria-hidden />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <SparklesIcon className="h-7 w-7 text-blue-500" aria-hidden />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900">No custom themes yet</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Open the theme builder to design a storefront, then return here to apply it or manage thumbnails.
                </p>
                <Link
                  to="/themes/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden />
                  Start in theme creator
                </Link>
              </div>
            ) : (
          <div className={`themes-layout ${viewMode}`}>
            {customThemes.map((ct) => {
              // Validate that the theme ID is a valid MongoDB ObjectId
              const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(ct._id);
              // Check if this custom theme is already installed
              const isInstalled = installedThemes.some((it: any) => {
                const isCustomTheme = it.isCustomTheme || it._id?.startsWith('custom-');
                const actualThemeId = isCustomTheme && it.customThemeId ? it.customThemeId : null;
                return isCustomTheme && actualThemeId === ct._id;
              });
              
              return (
              <div key={ct._id} className="theme-card" style={{ position: 'relative' }}>
                {/* 3-dots menu button */}
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
                    // Use preview if available, otherwise use server thumbnail with cache buster
                    const previewUrl = thumbnailPreviews[ct._id];
                    const serverThumbnailUrl = (ct as any).thumbnailUrl;
                    // Add cache buster only for server thumbnails, not previews
                    const thumbnailUrl = previewUrl || (serverThumbnailUrl ? `${serverThumbnailUrl}${serverThumbnailUrl.includes('?') ? '&' : '?'}v=${Date.now()}` : null);
                    
                    return thumbnailUrl ? (
                      <img
                        key={`${ct._id}-${previewUrl ? 'preview' : 'server'}`} // Force re-render when switching between preview and server
                        src={thumbnailUrl}
                        alt={ct.name || ''}
                        className="theme-image"
                        onLoad={() => {
                          // Image loaded successfully
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null;
                  })()}
                  <div className="theme-image-placeholder" style={{ display: (thumbnailPreviews[ct._id] || (ct as any).thumbnailUrl) ? 'none' : 'flex' }}>
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
                  </div>
                  <div className="theme-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => {
                        if (!isValidObjectId) {
                          alert('Invalid theme ID. This theme may have been created with an old format. Please delete and recreate it.');
                          return;
                        }
                        handleEditTheme(ct._id, false, true);
                      }}
                    >
                      Edit
                    </button>
                    {isInstalled ? (
                      <button
                        className="action-btn secondary"
                        disabled
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: '1px solid #16a34a',
                          cursor: 'not-allowed',
                          opacity: 0.9,
                        }}
                      >
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
                          // Install custom theme (copies files to store directory)
                          const success = await installCustomTheme(ct._id, activeStoreId);
                          if (success) {
                            // Wait a moment for file system to sync
                            await new Promise(resolve => setTimeout(resolve, 500));
                            // Refresh installed themes list
                            await fetchByStoreId(activeStoreId);
                            // Toast notification is already shown by installCustomTheme
                          }
                        }}
                      >
                        Apply theme
                      </button>
                    )}
                    <button
                      className="action-btn secondary"
                      onClick={() => handleDeleteCustomTheme(ct._id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: '1px solid #dc2626',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                        e.currentTarget.style.borderColor = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.borderColor = '#dc2626';
                      }}
                    >
                      <DeleteIcon fontSize="small" style={{ marginRight: '4px' }} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
            )}
          </div>
        </section>

        {/* All Themes - Section 4 */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <ThemeSectionHeader
            icon={SwatchIcon}
            title="Browse all themes"
            description="Ready-made templates from the library — install to preview on your store."
          />
          <div className="bg-gray-50/30 p-4 sm:p-5">
      <div className={`themes-layout ${viewMode}`}>
        {themesLoading && (
          <div className="col-span-full flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white py-16 shadow-sm">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
              aria-hidden
            />
            <p className="text-sm font-medium text-gray-600">Loading theme catalog…</p>
          </div>
        )}
        {themesError && (
          <div className="col-span-full rounded-xl border border-red-200 bg-red-50/80 px-4 py-4 text-sm text-red-900">
            <p className="font-semibold">Could not load themes</p>
            <p className="mt-1 text-red-800/90">{themesError}</p>
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
                {(theme as any).rating?.average > 0 && (
                  <div className="theme-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} fontSize="inherit" className="star filled" />
                      ))}
                    </div>
                    <span className="rating-text">{Number((theme as any).rating?.average).toFixed(1)}</span>
                  </div>
                )}
              </div>

              {theme.description && <p className="theme-description">{theme.description}</p>}

              <div className="theme-meta">
                {theme.category && <span className="theme-category">{theme.category}</span>}
                <span className="theme-price">Free</span>
              </div>

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
                    {String(installingThemeId) === String(theme._id) ? 'Installing…' : 'Install theme'}
                  </button>
                )}
                <button 
                  className="action-btn secondary"
                  onClick={() => handlePreviewClick(theme._id, theme.name)}
                >
                  View demo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!themesLoading && !themesError && filteredThemes.length === 0 && (
        <div className="col-span-full flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/90 px-6 py-12 text-center">
          <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" aria-hidden />
          <h3 className="mt-4 text-base font-semibold text-gray-900">No themes match your search</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">Try a different keyword or clear the search box to see the full catalog.</p>
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          ) : null}
        </div>
      )}
          </div>
        </section>

      {/* Theme Preview Modal */}
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
        onClose={() => setEditChoice({ isOpen: false, themeId: "", isInstalled: false, isCustomTheme: false })}
        themeId={editChoice.themeId}
        isCustomTheme={editChoice.isCustomTheme}
      />

      {/* Thumbnail Update Modal */}
      {thumbnailUpdateModal.isOpen && (
        <div className="thumbnail-update-modal-overlay" onClick={() => !uploadingThumbnail && setThumbnailUpdateModal({ isOpen: false, themeId: "", themeName: "" })}>
          <div className="thumbnail-update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="thumbnail-update-modal-header">
              <h2>Update Thumbnail</h2>
              <button
                className="thumbnail-update-modal-close"
                onClick={() => !uploadingThumbnail && setThumbnailUpdateModal({ isOpen: false, themeId: "", themeName: "" })}
                disabled={uploadingThumbnail}
              >
                ×
              </button>
            </div>
            <div className="thumbnail-update-modal-content">
              <p>Select an image to update the thumbnail for <strong>{thumbnailUpdateModal.themeName}</strong></p>
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