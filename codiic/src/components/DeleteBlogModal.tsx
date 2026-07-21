import Modal from './Modal';

interface DeleteBlogModalProps {
  isOpen: boolean;
  blogTitle?: string;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBlogModal({
  isOpen,
  blogTitle,
  deleting = false,
  onClose,
  onConfirm,
}: DeleteBlogModalProps) {
  const label = blogTitle?.trim() || 'blog';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={<h2 className="text-[14px] font-semibold text-gray-900">Delete blog?</h2>}
      maxWidth="sm"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </>
      }
    >
      <p className="text-[13px] font-normal leading-relaxed text-gray-700">
        Are you sure you want to delete the <span className="font-semibold">{label}</span> blog?
        This can&apos;t be undone.
      </p>
    </Modal>
  );
}
