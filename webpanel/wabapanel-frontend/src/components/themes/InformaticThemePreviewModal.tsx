'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, X } from 'lucide-react';
import { buildInformaticThemePreviewUrl } from '@/lib/api';
import './InformaticThemePreviewModal.css';

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  themeId: string;
  themeName: string;
};

type AnimPhase = 'enter' | 'shown' | 'exit';

/**
 * Catalog static HTML preview — same UX as Codiic ThemePreviewModal.
 * Loads uploaded theme content (index.html + assets on S3) via the preview API.
 */
export function InformaticThemePreviewModal({
  isOpen,
  onClose,
  themeId,
  themeName,
}: PreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [present, setPresent] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>('enter');
  const exitFallbackRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || !themeId) return;
    setPreviewUrl(buildInformaticThemePreviewUrl(themeId));
  }, [isOpen, themeId]);

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
              {isFullscreen ? (
                <Minimize2 size={15} strokeWidth={1.75} />
              ) : (
                <Maximize2 size={15} strokeWidth={1.75} />
              )}
            </button>
            <button
              type="button"
              className="tpm-icon-btn"
              onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
              title="Open in new tab"
              aria-label="Open in new tab"
              disabled={!previewUrl}
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
          {isLoading ? (
            <div className="tpm-loading" aria-live="polite">
              <div className="tpm-spinner" />
            </div>
          ) : null}
          {previewUrl ? (
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="tpm-frame"
              title={`${themeName} preview`}
              onLoad={() => setIsLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
