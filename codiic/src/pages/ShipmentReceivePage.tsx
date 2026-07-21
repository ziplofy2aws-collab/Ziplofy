import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TransferFormHeader from '../components/transfers/TransferFormHeader';
import {
  formatTransferLabel,
  TRANSFER_FORM_APPEARANCE,
  transferInputClass,
  transferTableCellClass,
  transferTableCellRightClass,
  transferTableHeadClass,
  transferTableHeadRightClass,
} from '../components/transfers/transfer-ui.util';
import {
  productFormCardClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
import { useTransferEntries } from '../contexts/transfer-entries.context';
import { useShipments } from '../contexts/shipment.context';

const ShipmentReceivePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: transferId, shipmentId } = useParams();
  const { entries, fetchByTransferId, loading } = useTransferEntries();
  const { receiveShipment, loading: shipmentsLoading } = useShipments();

  const [acceptByEntry, setAcceptByEntry] = useState<Record<string, number>>({});
  const [rejectByEntry, setRejectByEntry] = useState<Record<string, number>>({});

  useEffect(() => {
    if (transferId) fetchByTransferId(transferId).catch(() => {});
  }, [transferId, fetchByTransferId]);

  const handleAcceptChange =
    (entryId: string, transferredQty: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value ?? 0);
      const clampedAccept = Math.max(0, Math.min(transferredQty, Number.isNaN(raw) ? 0 : raw));
      setAcceptByEntry((prev) => ({ ...prev, [entryId]: clampedAccept }));
      setRejectByEntry((prev) => {
        const currentReject = prev[entryId] ?? 0;
        const maxReject = Math.max(0, transferredQty - clampedAccept);
        const clampedReject = Math.max(0, Math.min(maxReject, currentReject));
        if (clampedReject === currentReject) return prev;
        return { ...prev, [entryId]: clampedReject };
      });
    };

  const handleRejectChange =
    (entryId: string, transferredQty: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(event.target.value ?? 0);
      const currentAccept = acceptByEntry[entryId] ?? 0;
      const maxReject = Math.max(0, transferredQty - currentAccept);
      const clampedReject = Math.max(0, Math.min(maxReject, Number.isNaN(raw) ? 0 : raw));
      setRejectByEntry((prev) => ({ ...prev, [entryId]: clampedReject }));
    };

  const handleSave = async () => {
    if (!shipmentId || !transferId) return;
    const items = entries.map((entry) => ({
      entryId: entry._id,
      accept: Number(acceptByEntry[entry._id] || 0),
      reject: Number(rejectByEntry[entry._id] || 0),
    }));
    await receiveShipment(shipmentId, items);
    navigate(`/products/transfers/${transferId}`);
  };

  return (
    <div className={productFormPageClass(TRANSFER_FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        <TransferFormHeader
          title={`Receive shipment ${transferId ? formatTransferLabel(transferId) : ''}`}
          subtitle="Accept or reject quantities for each variant"
          backLabel="Back to transfer"
          onBack={() => (transferId ? navigate(`/products/transfers/${transferId}`) : navigate(-1))}
          onSubmit={() => void handleSave()}
          submitLabel={shipmentsLoading ? 'Saving…' : 'Save'}
          submitDisabled={shipmentsLoading}
        />

        <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
          <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Incoming inventory</h2>

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className={transferTableHeadClass}>Product</th>
                      <th className={transferTableHeadClass}>Variant</th>
                      <th className={transferTableHeadRightClass}>Transferred qty</th>
                      <th className={transferTableHeadRightClass}>Accept</th>
                      <th className={transferTableHeadRightClass}>Reject</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`${transferTableCellClass} py-12 text-center text-gray-500`}>
                          No entries
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry) => {
                        const optionText = entry.variantId.optionValues
                          ? Object.entries(entry.variantId.optionValues)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' • ')
                          : '';
                        const imageUrl = entry.variantId.images?.[0];

                        return (
                          <tr key={entry._id} className="border-b border-gray-100">
                            <td className={transferTableCellClass}>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                  {imageUrl ? (
                                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                      <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-[13px] font-medium text-gray-900">
                                  {entry.variantId.productName || 'Unnamed product'}
                                </p>
                              </div>
                            </td>
                            <td className={transferTableCellClass}>
                              <p className="text-[12px] text-gray-500">{optionText || '—'}</p>
                            </td>
                            <td className={`${transferTableCellRightClass} font-medium text-gray-900`}>
                              {entry.quantity}
                            </td>
                            <td className={transferTableCellRightClass}>
                              <input
                                type="number"
                                min={0}
                                max={entry.quantity}
                                value={acceptByEntry[entry._id] ?? ''}
                                onChange={handleAcceptChange(entry._id, Number(entry.quantity) || 0)}
                                className={`${transferInputClass} w-24 text-right`}
                              />
                            </td>
                            <td className={transferTableCellRightClass}>
                              <input
                                type="number"
                                min={0}
                                max={Math.max(
                                  0,
                                  (Number(entry.quantity) || 0) - (acceptByEntry[entry._id] ?? 0)
                                )}
                                value={rejectByEntry[entry._id] ?? ''}
                                onChange={handleRejectChange(entry._id, Number(entry.quantity) || 0)}
                                className={`${transferInputClass} w-24 text-right`}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShipmentReceivePage;
