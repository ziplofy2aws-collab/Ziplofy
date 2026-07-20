import React, { useState, useMemo } from 'react';
import { X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import './ThemePreviewModal.css';
import { useStore } from '../contexts/store.context';

interface ThemePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: string;
  themeName: string;
  isInstalled?: boolean; // Optional flag to indicate if this is an installed theme
  isCustomTheme?: boolean; // Optional flag to indicate if this is a custom theme
}

const ThemePreviewModal: React.FC<ThemePreviewModalProps> = ({
  isOpen,
  onClose,
  themeId,
  themeName,
  isInstalled = false,
  isCustomTheme = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { activeStoreId } = useStore();

  // Resolve installed theme URL - prioritizes store-specific, then user-specific, then default
  const resolveInstalledThemeUrl = useMemo((): string => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const cacheBuster = `?v=${Date.now()}`;
    
    // If this is a custom theme
    if (isCustomTheme) {
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
          return `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
        }
        
        // Priority 2: User-specific installed theme (if userId is available)
        if (userId) {
          return `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
        }
        
        // Fallback: try to extract actual custom theme ID
        const actualCustomThemeId = themeId.replace(/^custom-/, '');
        return `${apiBase}/custom-themes/${actualCustomThemeId}/files/index.html${cacheBuster}`;
      } else {
        // Direct custom theme (not installed), use custom theme file serving route
        return `${apiBase}/custom-themes/${themeId}/files/index.html${cacheBuster}`;
      }
    }
    
    // If not an installed theme, use default preview
    if (!isInstalled) {
      return `${apiBase}/themes/preview/${themeId}${cacheBuster}`;
    }
    
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
  }, [themeId, isInstalled, isCustomTheme, activeStoreId]);

  if (!isOpen) return null;

  const previewUrl = resolveInstalledThemeUrl;

  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`theme-preview-modal ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <h3>Theme Preview: {themeName}</h3>
            <span className="preview-badge">Live Demo</span>
          </div>
          <div className="modal-actions">
            <button
              className="action-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              className="action-btn"
              onClick={handleOpenInNewTab}
              title="Open in New Tab"
            >
              <ExternalLink size={16} />
            </button>
            <button
              className="action-btn close-btn"
              onClick={onClose}
              title="Close Preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading theme preview...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={previewUrl}
            className="theme-preview-iframe"
            title={`${themeName} Preview`}
            onLoad={handleIframeLoad}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            loading="lazy"
          />
        </div>
        
        <div className="modal-footer">
          <div className="preview-info">
            <p>This is a live preview of the theme. Interactive features may be limited in preview mode.</p>
          </div>
          <div className="preview-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close Preview
            </button>
            <button className="btn-primary" onClick={handleOpenInNewTab}>
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreviewModal;
