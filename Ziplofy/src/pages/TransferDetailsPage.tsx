import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useShipments } from '../contexts/shipment.context';
import { useTransferEntries } from '../contexts/transfer-entries.context';
import { useTransfers } from '../contexts/transfer.context';
import { useStore } from '../contexts/store.context';
import Modal from '../components/Modal';
import TransferFormHeader from '../components/transfers/TransferFormHeader';
import TransferEntriesTable from '../components/transfers/TransferEntriesTable';
import {
  formatTransferLabel,
  TRANSFER_FORM_APPEARANCE,
  transferPrimaryButtonClass,
  transferSecondaryButtonClass,
} from '../components/transfers/transfer-ui.util';
import {
  productFormAsideStackClass,
  productFormCardClass,
  productFormGridClass,
  productFormLabelClass,
  productFormInputClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
import ProductFormPageSkeleton from '../components/products/ProductFormPageSkeleton';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)}>{label}</p>
      <p className="text-[13px] text-gray-900">{value}</p>
    </div>
  );
}

const TransferDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const {
    transfers,
    deleteTransfer,
    updateTransfer,
    markReadyToShip,
    setTransfers,
    loading,
    fetchTransfersByStoreId,
  } = useTransfers();
  const transfer = useMemo(() => transfers.find(t => t._id === id), [transfers, id]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [readyDialogOpen, setReadyDialogOpen] = useState(false);
  const { entries, loading: entriesLoading, error: entriesError, fetchByTransferId } = useTransferEntries();
  const { getShipmentByTransferId, updateShipment, deleteShipment, shipments, loading: shipmentsLoading, markShipmentInTransit } = useShipments();
  const shipment = useMemo(() => {
    if (!transfer?._id) return null as any;
    return shipments.find(s => s.transferId === transfer._id) || null;
  }, [shipments, transfer?._id]);
  const [editShipmentOpen, setEditShipmentOpen] = useState(false);
  const [deleteShipmentOpen, setDeleteShipmentOpen] = useState(false);
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editCarrier, setEditCarrier] = useState('');
  const [editEta, setEditEta] = useState('');
  const [inTransitDialogOpen, setInTransitDialogOpen] = useState(false);

  useEffect(() => {
    if (activeStoreId && id && !transfer) {
      fetchTransfersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, id, transfer, fetchTransfersByStoreId]);

  useEffect(() => {
    if (transfer?._id) {
      fetchByTransferId(transfer._id).catch(() => {});
      getShipmentByTransferId(transfer._id).catch(() => {});
    }
  }, [transfer?._id, fetchByTransferId, getShipmentByTransferId]);

  const handleBack = useCallback(() => {
    navigate('/products/transfers');
  }, [navigate]);

  const handleDeleteTransfer = async () => {
    if (!transfer) return;

    try {
      await deleteTransfer(transfer._id);
      setDeleteDialogOpen(false);
      navigate('/products/transfers');
    } catch (error) {
      console.error('Failed to delete transfer:', error);
    }
  };

  const handleCancelTransfer = async () => {
    if (!transfer) return;

    try {
      await updateTransfer(transfer._id, { status: 'cancelled' });
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Failed to cancel transfer:', error);
    }
  };

  const handleReadyToShip = async () => {
    if (!transfer) return;
    try {
      await markReadyToShip(transfer._id);
      setReadyDialogOpen(false);
    } catch (error) {
      console.error('Failed to mark ready to ship:', error);
    }
  };

  if (loading && !transfer) {
    return <ProductFormPageSkeleton />;
  }

  if (!transfer) {
    return (
      <div className={productFormPageClass(TRANSFER_FORM_APPEARANCE)}>
        <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
          <TransferFormHeader title="Transfer not found" onBack={handleBack} />
          <div className="rounded-lg border border-gray-200/50 bg-white px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-gray-900">Transfer not found</p>
            <p className="mt-1.5 text-[13px] text-gray-500">
              This transfer isn&apos;t loaded yet or doesn&apos;t exist.
            </p>
            <button type="button" onClick={handleBack} className={`mt-6 ${transferPrimaryButtonClass}`}>
              Back to transfers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const originLocation = transfer.originLocationId;
  const destinationLocation = transfer.destinationLocationId;
  const formatLocationAddress = (location: typeof originLocation) => {
    if (!location) return '—';
    const parts = [
      location.address,
      [location.city, location.state, location.postalCode].filter(Boolean).join(', '),
    ].filter(Boolean);
    return parts.join(' · ') || '—';
  };

  return (
    <div className={productFormPageClass(TRANSFER_FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        <TransferFormHeader
          title={formatTransferLabel(transfer._id)}
          status={transfer.status}
          subtitle={`Created ${new Date(transfer.createdAt).toLocaleString()}`}
          onBack={handleBack}
          actions={
            <StatusMenus
              currentLabel={transfer.status.replace(/_/g, ' ')}
              transferId={transfer._id}
              onDeleteClick={() => setDeleteDialogOpen(true)}
              onCancelClick={() => setCancelDialogOpen(true)}
              isCancelled={transfer.status === 'cancelled'}
              status={transfer.status}
              onReadyClick={() => setReadyDialogOpen(true)}
              onCreateShipment={() =>
                navigate(`/products/transfers/${transfer._id}/shipment/new`, {
                  state: { transferId: transfer._id, entries },
                })
              }
              hasShipment={!!shipment}
            />
          }
        />

        <div className={productFormGridClass(TRANSFER_FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(TRANSFER_FORM_APPEARANCE)}>
            {transfer.status === 'cancelled' && (
              <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
                <p className="text-[13px] font-medium text-gray-900">Transfer cancelled</p>
                <p className="mt-1 text-[13px] text-gray-500">
                  This transfer has been cancelled and cannot be modified. You can view the details but no actions are available.
                </p>
              </section>
            )}

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Shipment</h2>
              {shipmentsLoading ? (
                <p className="mt-3 text-[13px] text-gray-500">Loading shipment…</p>
              ) : shipment ? (
                <>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label="Carrier"
                      value={shipment.carrier || '—'}
                    />
                    <ReadOnlyField
                      label="Estimated arrival"
                      value={
                        shipment.estimatedArrivalDate
                          ? new Date(shipment.estimatedArrivalDate).toLocaleDateString()
                          : '—'
                      }
                    />
                    <ReadOnlyField
                      label="Tracking number"
                      value={shipment.trackingNumber || '—'}
                    />
                    <ReadOnlyField
                      label="Status"
                      value={shipment.status.replace('_', ' ')}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {shipment.status === 'in_transit' ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/products/transfers/${transfer._id}/shipment/${shipment._id}/receive`)
                        }
                        className={transferPrimaryButtonClass}
                      >
                        Receive shipment
                      </button>
                    ) : shipment.status === 'received' ? null : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditTrackingNumber(shipment.trackingNumber || '');
                            setEditCarrier(shipment.carrier || '');
                            setEditEta(
                              shipment.estimatedArrivalDate
                                ? shipment.estimatedArrivalDate.slice(0, 10)
                                : ''
                            );
                            setEditShipmentOpen(true);
                          }}
                          className={transferSecondaryButtonClass}
                        >
                          Edit tracking
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteShipmentOpen(true)}
                          className={`${transferSecondaryButtonClass} text-red-600`}
                        >
                          Delete shipment
                        </button>
                        <button
                          type="button"
                          onClick={() => setInTransitDialogOpen(true)}
                          className={transferPrimaryButtonClass}
                        >
                          Mark as in transit
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-[13px] text-gray-500">No shipment created yet.</p>
              )}
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Transfer locations</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadOnlyField label="Origin" value={originLocation?.name || '—'} />
                <ReadOnlyField label="Destination" value={destinationLocation?.name || '—'} />
                <ReadOnlyField label="Origin address" value={formatLocationAddress(originLocation)} />
                <ReadOnlyField label="Destination address" value={formatLocationAddress(destinationLocation)} />
              </div>
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Products</h2>
              {entriesError ? <p className="mt-2 text-[13px] text-red-600">{entriesError}</p> : null}
              <div className="mt-3">
                <TransferEntriesTable entries={entries} loading={entriesLoading} />
              </div>
            </section>
          </div>

          <aside className={productFormAsideStackClass(TRANSFER_FORM_APPEARANCE)}>
            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Reference</h2>
              <div className="mt-3">
                <ReadOnlyField label="Reference name" value={transfer.referenceName || 'No reference'} />
              </div>
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Transfer date</h2>
              <div className="mt-3">
                <ReadOnlyField
                  label="Date"
                  value={
                    transfer.transferDate
                      ? new Date(transfer.transferDate).toLocaleDateString()
                      : 'Not set'
                  }
                />
                {transfer.transferDate ? (
                  <p className="mt-1 text-[12px] text-gray-500">
                    {new Date(transfer.transferDate).toLocaleTimeString()}
                  </p>
                ) : null}
              </div>
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Tags</h2>
              <div className="mt-3">
                {transfer.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {transfer.tags.map(tag => (
                      <span
                        key={tag._id}
                        className="inline-flex items-center rounded-md border border-gray-200/70 bg-gray-50 px-2 py-0.5 text-[12px] text-gray-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-500">No tags assigned</p>
                )}
              </div>
            </section>

            <section className={productFormCardClass(TRANSFER_FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(TRANSFER_FORM_APPEARANCE)}>Notes</h2>
              <div className="mt-3">
                {transfer.note ? (
                  <p className="whitespace-pre-wrap text-[13px] text-gray-900">{transfer.note}</p>
                ) : (
                  <p className="text-[13px] text-gray-500">No notes added</p>
                )}
              </div>
            </section>
          </aside>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete transfer"
          actions={
            <>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className={transferSecondaryButtonClass}
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTransfer}
                className={transferPrimaryButtonClass}
              >
                Yes, Delete Transfer
              </button>
            </>
          }
        >
          <p className="text-[13px] text-gray-900 mb-2">
            Do you really want to delete this transfer?
          </p>
          <div className="mb-2 rounded-md border border-gray-200/70 bg-gray-50 p-2">
            <p className="text-[12px] font-medium text-gray-600">
              Transfer ID: {transfer?._id}
            </p>
          </div>
          <p className="text-[12px] text-gray-500">
            This action cannot be undone. The transfer and all its associated entries will be permanently deleted.
          </p>
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          title="Cancel transfer"
          actions={
            <>
              <button
                type="button"
                onClick={() => setCancelDialogOpen(false)}
                className={transferSecondaryButtonClass}
              >
                No, Keep Transfer
              </button>
              <button
                type="button"
                onClick={handleCancelTransfer}
                className={transferPrimaryButtonClass}
              >
                Yes, Cancel Transfer
              </button>
            </>
          }
        >
          <p className="text-[13px] text-gray-900 mb-2">
            Are you sure you want to cancel this transfer?
          </p>
          <div className="mb-2 rounded-md border border-gray-200/70 bg-gray-50 p-2">
            <p className="text-[12px] font-medium text-gray-600">
              Transfer ID: {transfer?._id}
            </p>
          </div>
          <p className="text-[12px] text-gray-500">
            Once cancelled, this transfer cannot be modified or reactivated. The transfer will remain in your records for reference.
          </p>
        </Modal>

        {/* Ready To Ship Confirmation Modal */}
        <Modal
          open={readyDialogOpen}
          onClose={() => setReadyDialogOpen(false)}
          title="Mark as Ready to Ship"
          maxWidth="md"
          actions={
            <>
              <button
                type="button"
                onClick={() => setReadyDialogOpen(false)}
                className={transferSecondaryButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReadyToShip}
                className={transferPrimaryButtonClass}
              >
                Confirm
              </button>
            </>
          }
        >
          <p className="text-[13px] font-medium text-gray-900 mb-2">
            Mark as ready to ship
          </p>
          <p className="text-[13px] text-gray-500 mb-3">
            Marking the transfer as ready to ship will automatically reserve all inventory and stock all unavailable items at the shop location.
          </p>
          <div className="mb-3 rounded-md border border-gray-200/70 bg-gray-50 p-3">
            <p className="text-[12px] text-gray-600">
              Origin: <span className="font-medium">{transfer.originLocationId?.name}</span>
            </p>
            <p className="text-[12px] text-gray-600">
              Destination: <span className="font-medium">{transfer.destinationLocationId?.name}</span>
            </p>
          </div>
          <div className="rounded-md border border-gray-200/70 bg-white p-3">
            <p className="text-[12px] font-medium text-gray-900 mb-2">What happens next</p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-gray-600">
              <li>We will <span className="font-medium">reserve</span> the transfer quantities at the origin location so they cannot be sold.</li>
              <li>Origin inventory will be updated: <span className="font-medium">unavailable increases</span> by the transfer quantity and <span className="font-medium">available decreases</span> accordingly. On hand does not change.</li>
              <li>No stock physically moves yet. Destination inventory remains unchanged until shipment is created and received.</li>
            </ul>
          </div>
        </Modal>

        {/* Edit Shipment Modal */}
        <Modal
          open={editShipmentOpen}
          onClose={() => setEditShipmentOpen(false)}
          title="Edit shipment"
          actions={
            <>
              <button
                type="button"
                onClick={() => setEditShipmentOpen(false)}
                className={transferSecondaryButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!shipment) return;
                  await updateShipment(shipment._id, {
                    trackingNumber: editTrackingNumber,
                    carrier: editCarrier,
                    estimatedArrivalDate: editEta || undefined
                  });
                  setEditShipmentOpen(false);
                }}
                className={transferPrimaryButtonClass}
              >
                Save
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)}>Tracking number</label>
              <input
                type="text"
                value={editTrackingNumber}
                onChange={(e) => setEditTrackingNumber(e.target.value)}
                className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
              />
            </div>
            <div>
              <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)}>Shipping carrier</label>
              <input
                type="text"
                value={editCarrier}
                onChange={(e) => setEditCarrier(e.target.value)}
                className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
              />
            </div>
            <div>
              <label className={productFormLabelClass(TRANSFER_FORM_APPEARANCE)}>Estimated arrival date</label>
              <input
                type="date"
                value={editEta}
                onChange={(e) => setEditEta(e.target.value)}
                className={productFormInputClass(TRANSFER_FORM_APPEARANCE)}
              />
            </div>
          </div>
        </Modal>

        {/* Delete Shipment Confirmation Modal */}
        <Modal
          open={deleteShipmentOpen}
          onClose={() => setDeleteShipmentOpen(false)}
          title="Delete shipment"
          actions={
            <>
              <button
                type="button"
                onClick={() => setDeleteShipmentOpen(false)}
                className={transferSecondaryButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!shipment) return;
                  await deleteShipment(shipment._id);
                  setDeleteShipmentOpen(false);
                }}
                className={transferPrimaryButtonClass}
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-[13px] text-gray-900">Are you sure you want to delete this shipment?</p>
        </Modal>

        {/* Mark as In Transit Confirmation Modal */}
        <Modal
          open={inTransitDialogOpen}
          onClose={() => setInTransitDialogOpen(false)}
          title="Mark shipment as in transit"
          maxWidth="md"
          actions={
            <>
              <button
                type="button"
                onClick={() => setInTransitDialogOpen(false)}
                className={transferSecondaryButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!shipment) return;
                  try {
                    const res = await markShipmentInTransit(shipment._id);
                    setTransfers(prev => prev.map(t => t._id === res.transferId ? { ...t, status: 'in_progress' } : t));
                    setInTransitDialogOpen(false);
                  } catch (e) {
                    console.error('Failed to mark in transit', e);
                  }
                }}
                className={transferPrimaryButtonClass}
              >
                Mark as in transit
              </button>
            </>
          }
        >
          <p className="text-[13px] text-gray-900 mb-3">
            Are you sure you want to mark this transfer as in transit? These units will be marked as incoming to the destination and allowed to be received.
          </p>
          <div className="mb-3 rounded-md border border-gray-200/70 bg-gray-50 p-3">
            <p className="text-[12px] text-gray-600">Origin: <span className="font-medium">{transfer.originLocationId?.name}</span></p>
            <p className="text-[12px] text-gray-600">Destination: <span className="font-medium">{transfer.destinationLocationId?.name}</span></p>
            <p className="text-[12px] text-gray-600">Total units: <span className="font-medium">{entries.reduce((sum, e) => sum + (e.quantity || 0), 0)}</span></p>
          </div>
          <div className="rounded-md border border-gray-200/70 bg-white p-3">
            <p className="text-[12px] font-medium text-gray-900 mb-2">What happens next</p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-gray-600">
              <li>Origin: unavailable decreases by the transfer quantity.</li>
              <li>Destination: incoming increases by the transfer quantity.</li>
              <li>Transfer status changes to <span className="font-medium">in progress</span>.</li>
              <li>Shipment status changes to <span className="font-medium">in transit</span>.</li>
            </ul>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Header menus component
const StatusMenus: React.FC<{
  currentLabel: string;
  transferId: string;
  onDeleteClick: () => void;
  onCancelClick: () => void;
  onReadyClick: () => void;
  onCreateShipment: () => void;
  isCancelled: boolean;
  status: string;
  hasShipment: boolean;
}> = ({ onDeleteClick, onCancelClick, onReadyClick, onCreateShipment, isCancelled, status, hasShipment }) => {
  const [isMarkMenuOpen, setIsMarkMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const markMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (markMenuRef.current && !markMenuRef.current.contains(event.target as Node)) {
        setIsMarkMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMarkMenuOpen || isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMarkMenuOpen, isMoreMenuOpen]);

  const isDraft = status === 'draft';
  const isReady = status === 'ready_to_ship';

  return (
    <div className="flex items-center gap-2">
      {isReady && !hasShipment && (
        <button
          type="button"
          onClick={onCreateShipment}
          className={transferPrimaryButtonClass}
        >
          Create shipment
        </button>
      )}
      {isDraft && (
        <>
          <div className="relative" ref={markMenuRef}>
            <button
              type="button"
              disabled={isCancelled}
              onClick={() => setIsMarkMenuOpen(!isMarkMenuOpen)}
              className={`${transferSecondaryButtonClass} gap-1`}
            >
              Mark as
              <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {isMarkMenuOpen && (
              <div className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-md">
                {isDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMarkMenuOpen(false);
                      onReadyClick();
                    }}
                    className="flex w-full px-3 py-1.5 text-left text-[13px] text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    Ready to ship
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMarkMenuOpen(false)}
                  className="flex w-full px-3 py-1.5 text-left text-[13px] text-gray-900 transition-colors hover:bg-gray-50"
                >
                  In progress
                </button>
                <button
                  type="button"
                  onClick={() => setIsMarkMenuOpen(false)}
                  className="flex w-full px-3 py-1.5 text-left text-[13px] text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Transferred
                </button>
              </div>
            )}
          </div>
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              disabled={isCancelled}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`${transferSecondaryButtonClass} gap-1`}
            >
              More actions
              <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {isMoreMenuOpen && (
              <div className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-md">
                {!isCancelled && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onCancelClick();
                    }}
                    className="flex w-full px-3 py-1.5 text-left text-[13px] text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    Cancel transfer
                  </button>
                )}
                {isDraft && !isCancelled && !isReady && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onDeleteClick();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-red-600 transition-colors hover:bg-gray-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete transfer
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TransferDetailsPage;
