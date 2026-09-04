import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Select from '../components/Select';
import TransferFormHeader from '../components/transfers/TransferFormHeader';
import {
  formatTransferLabel,
  TRANSFER_FORM_APPEARANCE,
  transferPrimaryButtonClass,
} from '../components/transfers/transfer-ui.util';
import {
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
import { useShipments } from '../contexts/shipment.context';

const CARRIERS = [
  '4PX-99 Minutos',
  'Aeronet',
  'AGS',
  'Amazon',
  'Amazon Logistics UK',
  'AMM Expedition',
  'AN Post',
  'Anjun Logistics',
  'Apple Express',
].map((carrier) => ({ value: carrier, label: carrier }));

const ShipmentNewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { transferId?: string; entries?: any[] } };
  const params = useParams();
  const routeTransferId = params.id as string | undefined;
  const transferId = routeTransferId || location.state?.transferId;
  const entries = location.state?.entries || [];
  const { createShipment, loading } = useShipments();

  const [eta, setEta] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const totalUnits = useMemo(() => entries.reduce((sum, entry) => sum + (entry?.quantity || 0), 0), [entries]);

  const handleCreate = async () => {
    if (!transferId || !eta || !trackingNumber || !carrier) return;
    await createShipment({
      transferId,
      estimatedArrivalDate: eta,
      trackingNumber,
      carrier,
    });
    navigate(`/products/transfers/${transferId}`);
  };

  return (
    <div className={productFormPageClass(TRANSFER_FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1000px] py-4">
        <TransferFormHeader
          title={`Create shipment ${transferId ? formatTransferLabel(transferId) : ''}`}
          subtitle={`${totalUnits} unit${totalUnits === 1 ? '' : 's'} to ship`}
          backLabel="Back to transfer"
          onBack={() => (transferId ? navigate(`/products/transfers/${transferId}`) : navigate(-1))}
          onCancel={() => (transferId ? navigate(`/products/transfers/${transferId}`) : navigate(-1))}
          onSubmit={() => void handleCreate()}
          submitLabel={loading ? 'Creating…' : 'Create shipment'}
          submitDisabled={!eta || !trackingNumber || !carrier || !transferId || loading}
        />

        <div className={productFormMainStackClass(TRANSFER_FORM_APPEARANCE)}>
          <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
            <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Items to ship</h2>
            <div className="mt-3 space-y-2">
              {entries.length === 0 ? (
                <p className="text-[13px] text-gray-500">No entries found from transfer state.</p>
              ) : (
                entries.map((entry: any) => (
                  <div
                    key={entry._id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                      {entry.variantId?.images?.[0] ? (
                        <img src={entry.variantId.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-gray-900">
                        {entry.variantId?.productName || 'Unnamed product'}
                      </p>
                      {entry.variantId?.optionValues ? (
                        <p className="truncate text-[12px] text-gray-500">
                          {Object.entries(entry.variantId.optionValues)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' • ')}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[13px] text-gray-700">Qty: {entry.quantity}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
            <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Shipment details</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)} htmlFor="shipment-eta">
                  Estimated arrival date
                </label>
                <input
                  id="shipment-eta"
                  type="date"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
                />
              </div>
              <div>
                <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)} htmlFor="shipment-tracking">
                  Tracking number
                </label>
                <input
                  id="shipment-tracking"
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  label="Shipping carrier"
                  value={carrier}
                  options={CARRIERS}
                  onChange={setCarrier}
                  placeholder="Select carrier"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShipmentNewPage;
