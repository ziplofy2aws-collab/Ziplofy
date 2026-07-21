import React from 'react';

interface CustomerPersonalInfoFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const CustomerPersonalInfoFields: React.FC<CustomerPersonalInfoFieldsProps> = ({
  firstName,
  lastName,
  email,
  phoneNumber,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-600 mb-1">First Name</p>
        <p className="text-sm text-gray-900">{firstName}</p>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1">Last Name</p>
        <p className="text-sm text-gray-900">{lastName}</p>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1">Email</p>
        <p className="text-sm text-gray-900">{email}</p>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1">Phone Number</p>
        <p className="text-sm text-gray-900">{phoneNumber}</p>
      </div>
    </div>
  );
};

export default CustomerPersonalInfoFields;

