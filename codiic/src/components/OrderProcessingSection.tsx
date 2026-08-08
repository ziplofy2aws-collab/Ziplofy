import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminListCardClass } from './admin-list-ui';

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

const controlClass =
  'h-4 w-4 rounded border-admin-border text-admin-text focus:ring-1 focus:ring-[#005bd3]';

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
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-2 flex items-center">
        <h2 className="text-[13px] font-semibold text-admin-text">Order processing</h2>
        <div className="group relative ml-2">
          <button
            className="p-1 text-admin-text-subdued transition-colors hover:text-admin-text-secondary"
            title="Order processing settings"
            aria-label="Order processing settings"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mb-4 text-[13px] text-admin-text-secondary">
        Automate fulfillment and archiving behavior for paid orders.
      </p>

      {/* After an order has been paid */}
      <div className="mb-6">
        <p className="mb-3 text-[12px] font-medium text-admin-text-subdued">
          After an order has been paid
        </p>
        <div className="space-y-2">
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="fulfillment-option"
                value="fulfill_all"
                checked={fulfillmentOption === 'fulfill_all'}
                onChange={onFulfillmentOptionChange}
                className={controlClass}
              />
              <span className="text-[13px] text-admin-text">
                Automatically fulfill the order&apos;s line items
              </span>
            </label>
            {fulfillmentOption === 'fulfill_all' && (
              <div className="ml-6 mt-2 space-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifyCustomers}
                    onChange={onNotifyCustomersChange}
                    className={controlClass}
                  />
                  <span className="text-[13px] text-admin-text">
                    Notify customers of their shipment
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fulfillHighRiskOrders}
                    onChange={onFulfillHighRiskOrdersChange}
                    className={controlClass}
                  />
                  <span className="text-[13px] text-admin-text">
                    Automatically fulfill all orders, even those with a high risk of fraud
                  </span>
                </label>
              </div>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="fulfillment-option"
              value="fulfill_gift_cards"
              checked={fulfillmentOption === 'fulfill_gift_cards'}
              onChange={onFulfillmentOptionChange}
              className={controlClass}
            />
            <span className="text-[13px] text-admin-text">
              Automatically fulfill only the gift cards of the order
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="fulfillment-option"
              value="dont_fulfill"
              checked={fulfillmentOption === 'dont_fulfill'}
              onChange={onFulfillmentOptionChange}
              className={controlClass}
            />
            <span className="text-[13px] text-admin-text">
              Don&apos;t fulfill any of the order&apos;s line items automatically
            </span>
          </label>
        </div>
      </div>

      {/* After an order has been fulfilled and paid */}
      <div>
        <p className="mb-3 text-[12px] font-medium text-admin-text-subdued">
          After an order has been fulfilled and paid, or when all items have been refunded
        </p>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={autoArchive}
            onChange={onAutoArchiveChange}
            className={controlClass}
          />
          <span className="text-[13px] text-admin-text">Automatically archive the order</span>
        </label>
        <p className="ml-6 mt-1 text-[12px] text-admin-text-subdued">
          The order will be removed from your list of open orders.
        </p>
      </div>
    </div>
  );
}
