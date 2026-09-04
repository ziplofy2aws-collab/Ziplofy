'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const requestClose = () => {
    if (guard && dirty) { setWarn(true); return; }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-black/45" onClick={requestClose} />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)] ${sizeMap[size]}`}
        onInput={() => setDirty(true)}
        onChangeCapture={() => setDirty(true)}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-admin-border px-5 py-3.5 sm:px-6">
            <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">{title}</h3>
            <button type="button" onClick={requestClose} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
      {warn && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-[360px] max-w-[90vw] rounded-xl border border-admin-border bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-admin-text">Unsaved changes</h3>
            <p className="mt-1 text-[13px] text-admin-text-secondary">Your changes have not been saved. To save them, click Cancel below and use the form&apos;s Save button.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={() => setWarn(false)} className="w-full rounded-lg bg-admin-text px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1a1a1a]">Go back — I&apos;ll save</button>
              <button type="button" onClick={() => { setWarn(false); setDirty(false); onClose(); }} className="w-full rounded-lg border border-admin-border bg-white px-4 py-2 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]">Close without saving (Discard)</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
