import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define the types for the modal props to ensure type safety in TypeScript
type ModalProps = {
  onClose: () => void; // Callback function to handle modal close events
  open: boolean; // Boolean to determine if the modal is visible (using 'open' for backward compatibility)
  children: React.ReactNode; // The content to render inside the modal
  width?: number; // Optional width of the modal
  height?: number; // Optional height of the modal
  isCallModal?: boolean; // Optional flag to prevent closing on backdrop click
  title?: React.ReactNode; // Optional title for the modal
  maxWidth?: 'sm' | 'md' | 'lg'; // Optional max width preset
  actions?: React.ReactNode; // Optional action buttons
  /** Stack above nested overlays (e.g. theme editor bottom sheets). Default 5000. */
  zIndex?: number;
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
  zIndex = 5000,
}: ModalProps) => {
  // Local state to track whether the modal is mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  // Effect hook to ensure the modal logic runs only on the client side
  useEffect(() => {
    setMounted(true); // Set the mounted state to true when the component is rendered on the client
    return () => setMounted(false); // Cleanup to set the mounted state to false when the component unmounts
  }, []);

  // Prevent body scroll when modal is open
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

  // If the modal is not open or the component is not yet mounted on the client, render nothing
  if (!open || !mounted) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
  };

  const modalWidth = width ? `${width}px` : undefined;
  const modalHeight = height ? `${height}px` : undefined;

  // Use React Portals to render the modal content outside of the main DOM hierarchy
  return createPortal(
    <div
      onClick={isCallModal ? () => {} : onClose} // Clicking outside the modal content triggers the `onClose` function (unless it's a call modal)
      className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
      style={{ zIndex }}
    >
      {/* Modal content container */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent the click event from propagating to the overlay
        className={`relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 ${maxWidthClasses[maxWidth]} ${
          modalHeight ? '' : 'max-h-[min(92vh,calc(100vh-48px))]'
        }`}
        style={{
          width: modalWidth,
          height: modalHeight,
        }}
      >
        {/* Title section */}
        {title && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 px-5 py-4">
            {typeof title === 'string' ? (
              <h2 className="border-l-4 border-blue-500/70 pl-3 text-lg font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
            ) : (
              <div className="min-w-0 flex-1">{title}</div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content section */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/30 px-5 py-5">{children}</div>

        {/* Actions section */}
        {actions && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200/80 bg-white px-5 py-4">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement // Render the modal into the modal root (defined in index.html)
  );
};

export default Modal;
