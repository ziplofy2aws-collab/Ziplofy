import { PencilIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import AddNoteModal from '../../AddNoteModal';
import DraftOrderCard from './DraftOrderCard';

type DraftOrderNotesSectionProps = {
  notes: string;
  onNotesChange: (notes: string) => void;
};

const DraftOrderNotesSection: React.FC<DraftOrderNotesSectionProps> = ({
  notes,
  onNotesChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveNote = useCallback(
    (note: string) => {
      onNotesChange(note);
    },
    [onNotesChange]
  );

  return (
    <>
      <DraftOrderCard
        title="Notes"
        headerAction={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Edit notes"
          >
            <PencilIcon className="h-4 w-4" aria-hidden />
          </button>
        }
        bodyClassName="px-4 py-3"
      >
        <p className="text-[13px] text-gray-500">{notes.trim() ? notes : 'No notes'}</p>
      </DraftOrderCard>

      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialNote={notes}
      />
    </>
  );
};

export default DraftOrderNotesSection;
