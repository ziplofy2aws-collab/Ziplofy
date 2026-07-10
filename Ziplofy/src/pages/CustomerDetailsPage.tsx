import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddCustomerAddressModal from '../components/customer/AddCustomerAddressModal';
import CustomerAddressesSection from '../components/customer/CustomerAddressesSection';
import CustomerMarketingAndNotesFields from '../components/customer/CustomerMarketingAndNotesFields';
import CustomerPersonalInfoFields from '../components/customer/CustomerPersonalInfoFields';
import CustomerSettingsInfoFields from '../components/customer/CustomerSettingsInfoFields';
import CustomerTagsDisplay from '../components/customer/CustomerTagsDisplay';
import CustomerTimelineSection from '../components/customer/CustomerTimelineSection';
import CustomerTimestampFields from '../components/customer/CustomerTimestampFields';
import type { CreateCustomerAddressRequest } from '../contexts/customer-address.context';
import { useCustomerAddresses } from '../contexts/customer-address.context';
import { useCustomers } from '../contexts/customer.context';

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { fetchCustomerAddressesByCustomerId, addCustomerAddress } = useCustomerAddresses();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const customer = useMemo(() => customers.find((c) => c._id === id), [customers, id]);


  const handleSaveAddress = useCallback(
    async (data: CreateCustomerAddressRequest) => {
      if (!id) return;
      await addCustomerAddress(data);
      setIsAddressModalOpen(false);
      fetchCustomerAddressesByCustomerId(id);
    },
    [id, addCustomerAddress, fetchCustomerAddressesByCustomerId]
  );

  const handleCloseAddressModal = useCallback(() => {
    setIsAddressModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to customers
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {customer ? `${customer.firstName} ${customer.lastName}` : 'Customer'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Customer details and information</p>
            </div>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Address
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl">
          {customer ? (
            <div className="flex flex-col gap-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Information</h2>
                
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomerPersonalInfoFields
                      firstName={customer.firstName}
                      lastName={customer.lastName}
                      email={customer.email}
                      phoneNumber={customer.phoneNumber}
                    />
                    <CustomerSettingsInfoFields
                      language={customer.language}
                      collectTax={customer.collectTax}
                      storeId={customer.storeId}
                    />
                  </div>
                  <CustomerTimestampFields
                    createdAt={customer.createdAt}
                    updatedAt={customer.updatedAt}
                  />
                  <CustomerMarketingAndNotesFields
                    agreedToMarketingEmails={customer.agreedToMarketingEmails}
                    agreedToSmsMarketing={customer.agreedToSmsMarketing}
                    notes={customer.notes}
                  />
                  <CustomerTagsDisplay tags={customer.tagIds} />
                </div>
              </div>

              {id && <CustomerAddressesSection customerId={id} />}
              {id && <CustomerTimelineSection customerId={id} />}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Customer not found in state.</p>
          )}
        </div>

        {/* Add Customer Address Modal */}
        {id && (
          <AddCustomerAddressModal
            isOpen={isAddressModalOpen}
            onClose={handleCloseAddressModal}
            onSubmit={handleSaveAddress}
            customerId={id}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
