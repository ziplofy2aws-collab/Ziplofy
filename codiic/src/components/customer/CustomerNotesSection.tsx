import React, { useCallback } from 'react';
import {
  customerInputClass,
  customerSectionSubtitleClass,
  customerSectionTitleClass,
} from '../customers/customer-ui.util';

interface CustomerNotesSectionProps {
  notes: string;
  onChange: (notes: string) => void;
}

const CustomerNotesSection: React.FC<CustomerNotesSectionProps> = ({
  notes,
  onChange,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className={customerSectionTitleClass}>Notes</h2>
        <p className={customerSectionSubtitleClass}>Internal notes about this customer.</p>
      </div>
      <div className="px-4 py-4">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Add any additional notes about this customer..."
          rows={4}
          className={`${customerInputClass} resize-none`}
        />
      </div>
    </div>
  );
};

export default CustomerNotesSection;
