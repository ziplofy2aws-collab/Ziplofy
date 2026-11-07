'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FlowButton } from '@/components/ui/flow-button';
import { appModalGlassPanel } from '@/components/ui/AppFormModal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  guard?: boolean;
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

/** App-wide glass modal — matches previous Create workspace look. */
export default function Modal({ isOpen, onClose, title, children, size = 'md', guard = true }: ModalProps) {
  const [dirty, setDirty] = useState(false);
  const [warn, setWarn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    setDirty(false);
    setWarn(false);
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const requestClose = () => {
    if (guard && dirty) {
      setWarn(true);
      return;
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[3px]"
        onClick={requestClose}
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col ${appModalGlassPanel} ${sizeMap[size]}`}
        onInput={() => setDirty(true)}
        onChangeCapture={() => setDirty(true)}
      >
        {title && (
          <div className="flex items-start justify-between gap-3 border-b border-white/50 px-5 py-4 sm:px-7">
            <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={requestClose}
              className="rounded-xl border border-white/80 bg-white/55 p-2 text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
      </div>
      {warn && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-[3px]"
            onClick={() => setWarn(false)}
          />
          <div className={`relative w-full max-w-md ${appModalGlassPanel} px-5 py-6 sm:px-7`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/75">
              Warning
            </p>
            <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-slate-900">
              Unsaved changes
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Your changes have not been saved. To save them, go back and use the form&apos;s Save
              button.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <FlowButton
                type="button"
                text="Go back — I'll save"
                className="sm:w-auto sm:min-w-[160px]"
                onClick={() => setWarn(false)}
              />
              <FlowButton
                type="button"
                text="Close without saving"
                className="sm:w-auto sm:min-w-[190px]"
                onClick={() => {
                  setWarn(false);
                  setDirty(false);
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
