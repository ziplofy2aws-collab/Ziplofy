import React from 'react';

interface CustomerMarketingAndNotesFieldsProps {
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
  notes?: string;
}

const CustomerMarketingAndNotesFields: React.FC<CustomerMarketingAndNotesFieldsProps> = ({
  agreedToMarketingEmails,
  agreedToSmsMarketing,
  notes,
}) => {
  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-600 mb-1">Marketing Emails</p>
          <p className="text-sm">
            {agreedToMarketingEmails ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Agreed
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                Not Agreed
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">SMS Marketing</p>
          <p className="text-sm">
            {agreedToSmsMarketing ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Agreed
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                Not Agreed
              </span>
            )}
          </p>
        </div>
      </div>
      {notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Notes</p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
};

export default CustomerMarketingAndNotesFields;

