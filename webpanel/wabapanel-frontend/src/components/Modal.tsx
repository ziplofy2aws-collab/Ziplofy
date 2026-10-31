import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

type ModalProps = {
  onClose: () => void;
  open: boolean;
  children: React.ReactNode;
  width?: number;
  height?: number;
  isCallModal?: boolean;
  title?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  actions?: React.ReactNode;
};

export const Modal = ({
  open = false,
  onClose,
  children,
  width,
  height,
  isCallModal = false,
  title,
  maxWidth = 'sm',
  actions,
}: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open && mounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
  };

  const modalWidth = width ? `${width}px` : undefined;
  const modalHeight = height ? `${height}px` : undefined;

  return createPortal(
    <div
      onClick={isCallModal ? () => {} : onClose}
      className="fixed inset-0 z-[5000] flex h-screen w-screen items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-lg ${maxWidthClasses[maxWidth]} ${
          modalHeight ? '' : 'max-h-[min(92vh,calc(100vh-48px))]'
        }`}
        style={{
          width: modalWidth,
          height: modalHeight,
        }}
        role="dialog"
        aria-modal="true"
      >
        {title ? (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-admin-divider bg-admin-table-header px-5 py-3.5">
            {typeof title === 'string' ? (
              <h2 className="text-[15px] font-semibold tracking-tight text-admin-text">{title}</h2>
            ) : (
              <div className="min-w-0 flex-1">{title}</div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto bg-admin-surface px-5 py-5">{children}</div>

        {actions ? (
          <div className="flex shrink-0 justify-end gap-2 border-t border-admin-divider bg-admin-surface px-5 py-3.5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
};

export default Modal;
