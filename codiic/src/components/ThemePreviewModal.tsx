import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import './ThemePreviewModal.css';
import { useStore } from '../contexts/store.context';

interface ThemePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: string;
  themeName: string;
  isInstalled?: boolean;
  isCustomTheme?: boolean;
}

type AnimPhase = 'enter' | 'shown' | 'exit';

function getUserIdFromToken(): string | null {
  try {
    const token =
      localStorage.getItem('accessToken') ||
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
  const [present, setPresent] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>('enter');
  const exitFallbackRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { activeStoreId } = useStore();

  const previewUrl = useMemo((): string => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const cacheBuster = `?v=${Date.now()}`;

    if (isCustomTheme) {
      if (themeId.startsWith('custom-')) {
        const userId = getUserIdFromToken();
        if (activeStoreId) {
          return `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
        }
        if (userId) {
          return `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
        }
        const actualCustomThemeId = themeId.replace(/^custom-/, '');
        return `${apiBase}/custom-themes/${actualCustomThemeId}/files/index.html${cacheBuster}`;
      }
      return `${apiBase}/custom-themes/${themeId}/files/index.html${cacheBuster}`;
    }

    if (!isInstalled) {
      return `${apiBase}/themes/preview/${themeId}${cacheBuster}`;
    }

    const userId = getUserIdFromToken();
    if (activeStoreId) {
      return `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
    }
    if (userId) {
      return `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme/index.html${cacheBuster}`;
    }
    return `${apiBase}/themes/preview/${themeId}${cacheBuster}`;
  }, [themeId, isInstalled, isCustomTheme, activeStoreId]);

  useEffect(() => {
    if (!isOpen) return;
    if (exitFallbackRef.current != null) {
      window.clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }
    setPresent(true);
    setAnimPhase('enter');
    setIsLoading(true);
    setIsFullscreen(false);
  }, [isOpen, previewUrl]);

  useEffect(() => {
    if (isOpen || !present) return;

    setAnimPhase('exit');
    exitFallbackRef.current = window.setTimeout(() => {
      setPresent(false);
      exitFallbackRef.current = null;
    }, 400);

    return () => {
      if (exitFallbackRef.current != null) {
        window.clearTimeout(exitFallbackRef.current);
        exitFallbackRef.current = null;
      }
    };
  }, [isOpen, present]);

  const requestClose = useCallback(() => {
    if (animPhase === 'exit') return;
    onCloseRef.current();
  }, [animPhase]);

  useEffect(() => {
    if (!present) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [present, requestClose]);

  const handleShellAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const name = event.animationName || '';

      if (name.includes('tpm-sheet-up') && animPhase === 'enter') {
        setAnimPhase('shown');
        return;
      }

      if (name.includes('tpm-sheet-down') && animPhase === 'exit') {
        if (exitFallbackRef.current != null) {
          window.clearTimeout(exitFallbackRef.current);
          exitFallbackRef.current = null;
        }
        setPresent(false);
      }
    },
    [animPhase]
  );

  if (!present) return null;

  const phaseClass =
    animPhase === 'enter' ? 'is-enter' : animPhase === 'exit' ? 'is-exit' : 'is-shown';

  return (
    <div
      className={`theme-preview-modal${isFullscreen ? ' is-fullscreen' : ''}${
        animPhase === 'exit' ? ' is-closing' : ''
      }`}
    >
      <button
        type="button"
        className={`tpm-overlay ${phaseClass}`}
        aria-label="Close preview"
        onClick={requestClose}
      />

      <div
        className={`tpm-shell ${phaseClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${themeName} preview`}
        onAnimationEnd={handleShellAnimationEnd}
      >
        <header className="tpm-bar">
          <div className="tpm-bar-left">
            <span className="tpm-dot" aria-hidden />
            <h3 className="tpm-title">{themeName}</h3>
          </div>
          <div className="tpm-bar-actions">
            <button
              type="button"
              className="tpm-icon-btn"
              onClick={() => setIsFullscreen((v) => !v)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15} strokeWidth={1.75} /> : <Maximize2 size={15} strokeWidth={1.75} />}
            </button>
            <button
              type="button"
              className="tpm-icon-btn"
              onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <ExternalLink size={15} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="tpm-icon-btn tpm-close"
              onClick={requestClose}
              title="Close"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="tpm-viewport">
          {isLoading && (
            <div className="tpm-loading" aria-live="polite">
              <div className="tpm-spinner" />
            </div>
          )}
          <iframe
            src={previewUrl}
            className="tpm-frame"
            title={`${themeName} preview`}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          />
        </div>
      </div>
    </div>
  );
};

export default ThemePreviewModal;
