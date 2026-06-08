import React, { useCallback } from 'react';

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
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Notes</h2>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Add any additional notes about this customer..."
        rows={4}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none"
      />
    </div>
  );
};

export default CustomerNotesSection;

