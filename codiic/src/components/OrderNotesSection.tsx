import { PencilIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import AddNoteModal from './AddNoteModal';

interface OrderNotesSectionProps {
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

const OrderNotesSection: React.FC<OrderNotesSectionProps> = ({
  notes = '',
  onNotesChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSaveNote = useCallback(
    (note: string) => {
      if (onNotesChange) {
        onNotesChange(note);
      }
    },
    [onNotesChange]
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 pl-3 border-l-4 border-blue-600">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Notes</h3>
              <p className="text-sm text-gray-500">
                {notes.trim() || 'No notes'}
              </p>
            </div>
            <button
              onClick={handleEditClick}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
              aria-label="Edit notes"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        initialNote={notes}
      />
    </>
  );
};

export default OrderNotesSection;

