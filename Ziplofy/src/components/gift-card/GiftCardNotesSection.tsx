import { PencilIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';

interface GiftCardNotesSectionProps {
  giftCard: GiftCard;
  isEditingNotes: boolean;
  editedNotes: string;
  isUpdatingNotes: boolean;
  onEditNotes: () => void;
  onCancelEditNotes: () => void;
  onSaveNotes: () => void;
  onNotesChange: (notes: string) => void;
}

const GiftCardNotesSection: React.FC<GiftCardNotesSectionProps> = ({
  giftCard,
  isEditingNotes,
  editedNotes,
  isUpdatingNotes,
  onEditNotes,
  onCancelEditNotes,
  onSaveNotes,
  onNotesChange
}) => {
  return (
    <div className="md:col-span-4">
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
              <PencilIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Notes</h2>
              <p className="text-xs text-gray-600 mt-0.5">Additional information about this gift card</p>
            </div>
          </div>
          {!isEditingNotes && giftCard.isActive && (
            <button
              onClick={onEditNotes}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div>
            <textarea
              value={editedNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              placeholder="Enter notes for this gift card..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none mb-3 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancelEditNotes}
                disabled={isUpdatingNotes}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSaveNotes}
                disabled={isUpdatingNotes}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingNotes ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
            {giftCard.notes ? (
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {giftCard.notes}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">
                No notes available for this gift card
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardNotesSection;

