import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface OrderProcessingSectionProps {
  fulfillmentOption: 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill';
  notifyCustomers: boolean;
  fulfillHighRiskOrders: boolean;
  autoArchive: boolean;
  onFulfillmentOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNotifyCustomersChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFulfillHighRiskOrdersChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAutoArchiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function OrderProcessingSection({
  fulfillmentOption,
  notifyCustomers,
  fulfillHighRiskOrders,
  autoArchive,
  onFulfillmentOptionChange,
  onNotifyCustomersChange,
  onFulfillHighRiskOrdersChange,
  onAutoArchiveChange,
}: OrderProcessingSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="flex items-center mb-2">
        <h2 className="text-base font-semibold text-gray-900">Order processing</h2>
        <div className="ml-2 group relative">
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Order processing settings"
            aria-label="Order processing settings"
          >
            <InformationCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">Automate fulfillment and archiving behavior for paid orders.</p>

      {/* After an order has been paid */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 mb-3">After an order has been paid</p>
        <div className="space-y-2">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fulfillment-option"
                value="fulfill_all"
                checked={fulfillmentOption === 'fulfill_all'}
                onChange={onFulfillmentOptionChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
              />
              <span className="text-sm text-gray-900">Automatically fulfill the order's line items</span>
            </label>
            {fulfillmentOption === 'fulfill_all' && (
              <div className="ml-6 mt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyCustomers}
                    onChange={onNotifyCustomersChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="text-sm text-gray-900">Notify customers of their shipment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fulfillHighRiskOrders}
                    onChange={onFulfillHighRiskOrdersChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="text-sm text-gray-900">Automatically fulfill all orders, even those with a high risk of fraud</span>
                </label>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fulfillment-option"
              value="fulfill_gift_cards"
              checked={fulfillmentOption === 'fulfill_gift_cards'}
              onChange={onFulfillmentOptionChange}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-gray-900">Automatically fulfill only the gift cards of the order</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fulfillment-option"
              value="dont_fulfill"
              checked={fulfillmentOption === 'dont_fulfill'}
              onChange={onFulfillmentOptionChange}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-gray-900">Don't fulfill any of the order's line items automatically</span>
          </label>
        </div>
      </div>

      {/* After an order has been fulfilled and paid */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">
          After an order has been fulfilled and paid, or when all items have been refunded
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoArchive}
            onChange={onAutoArchiveChange}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
          />
          <span className="text-sm text-gray-900">Automatically archive the order</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          The order will be removed from your list of open orders.
        </p>
      </div>
    </div>
  );
}

