import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGiftCards } from '../contexts/gift-cards.context';
import { useStore } from '../contexts/store.context';

const NewGiftCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { createGiftCard, loading } = useGiftCards();
  const { activeStoreId } = useStore();
  const [formData, setFormData] = useState({
    giftCardCode: '',
    initialValue: '',
    noExpirationDate: false,
    setExpirationDate: false,
    expirationDate: '',
    notes: ''
  });

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCheckboxChange = useCallback((field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
      // If setting expiration date, uncheck no expiration
      ...(field === 'setExpirationDate' && checked ? { noExpirationDate: false } : {}),
      // If setting no expiration, uncheck set expiration
      ...(field === 'noExpirationDate' && checked ? { setExpirationDate: false } : {})
    }));
  }, []);

  const generateRandomCode = useCallback(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    handleInputChange('giftCardCode', result);
  }, [handleInputChange]);

  const handleBack = useCallback(() => {
    navigate('/products/gift-cards');
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    try {
      // Validate required fields
      if (!formData.giftCardCode.trim()) {
        alert('Please enter a gift card code');
        return;
      }
      
      if (!formData.initialValue || parseFloat(formData.initialValue) <= 0) {
        alert('Please enter a valid initial value');
        return;
      }

      if (!activeStoreId) {
        alert('No active store selected');
        return;
      }

      // Prepare the payload
      const payload = {
        storeId: activeStoreId,
        code: formData.giftCardCode.trim(),
        initialValue: parseFloat(formData.initialValue),
        expirationDate: formData.setExpirationDate && formData.expirationDate ? formData.expirationDate : undefined,
        notes: formData.notes.trim() || undefined,
        isActive: true
      };

      // Create the gift card
      await createGiftCard(payload);
      
      // Navigate back to gift cards list on success
      navigate('/products/gift-cards');
      
    } catch (error) {
      console.error('Error creating gift card:', error);
      // Error is already handled by the context, but we can show a user-friendly message
      alert('Failed to create gift card. Please try again.');
    }
  }, [formData, activeStoreId, createGiftCard, navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Page Header */}
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-medium text-gray-900">Create Gift Card</h1>
                <p className="text-sm text-gray-600 mt-0.5">Create a new gift card for your store</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-6 px-4">
          {/* Gift Card Details Segment */}
          <div className="bg-white rounded border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-medium text-gray-900 mb-4">Gift Card Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gift Card Code */}
              <div className="sm:col-span-1">
                <label htmlFor="giftCardCode" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gift Card Code
                </label>
                <div className="relative">
                  <input
                    id="giftCardCode"
                    type="text"
                    value={formData.giftCardCode}
                    onChange={(e) => handleInputChange('giftCardCode', e.target.value)}
                    placeholder="Enter gift card code"
                    className="w-full px-3 py-1.5 pr-10 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors text-base"
                  />
                  <button
                    onClick={generateRandomCode}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Generate random code"
                    type="button"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-600">Unique code for the gift card</p>
              </div>
              
              {/* Initial Value */}
              <div className="sm:col-span-1">
                <label htmlFor="initialValue" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Initial Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-base">₹</span>
                  <input
                    id="initialValue"
                    type="number"
                    value={formData.initialValue}
                    onChange={(e) => handleInputChange('initialValue', e.target.value)}
                    placeholder="Enter initial value"
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors text-base"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">Initial value in INR</p>
              </div>
            </div>
          </div>

          {/* Expiration Date Segment */}
          <div className="bg-white rounded border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-medium text-gray-900 mb-2">Expiration Date</h2>
            
            <p className="text-xs text-gray-600 mb-4 italic">
              Countries have different laws for gift card expiry dates. Check the laws for your country before starting this tutorial.
            </p>
            
            {/* No Expiration Date Checkbox */}
            <div className="mb-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.noExpirationDate}
                  onChange={(e) => handleCheckboxChange('noExpirationDate', e.target.checked)}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">No expiration date</span>
              </label>
            </div>
            
            {/* Set Expiration Date Checkbox */}
            <div className="mb-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.setExpirationDate}
                  onChange={(e) => handleCheckboxChange('setExpirationDate', e.target.checked)}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">Set expiration date</span>
              </label>
            </div>
            
            {/* Date Input */}
            {formData.setExpirationDate && (
              <div className="mt-3">
                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiration Date
                </label>
                <input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors text-base"
                />
                <p className="mt-1 text-xs text-gray-600">Select the date when this gift card expires</p>
              </div>
            )}
          </div>

          {/* Notes Segment */}
          <div className="bg-white rounded border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-medium text-gray-900 mb-4">Notes</h2>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes for this gift card..."
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors resize-none text-base"
              />
              <p className="mt-1 text-xs text-gray-600">Optional: Add any notes or comments about this gift card</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Gift Card'
              )}
            </button>
          </div>
        </div>
    </div>
  );
};

export default NewGiftCardPage;
