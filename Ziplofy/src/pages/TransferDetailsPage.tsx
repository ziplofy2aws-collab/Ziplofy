import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CubeIcon,
  MapPinIcon,
  InformationCircleIcon,
  TagIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useShipments } from '../contexts/shipment.context';
import { useTransferEntries } from '../contexts/transfer-entries.context';
import { useTransfers } from '../contexts/transfer.context';
import Modal from '../components/Modal';

const TransferDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transfers, deleteTransfer, updateTransfer, markReadyToShip, setTransfers } = useTransfers();
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
    if (transfer?._id) {
      fetchByTransferId(transfer._id).catch(() => {});
      getShipmentByTransferId(transfer._id).catch(() => {});
    }
  }, [transfer?._id, fetchByTransferId, getShipmentByTransferId]);

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

  if (!transfer) {
    return (
      <div className="min-h-screen bg-page-background-color">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="border border-gray-200 p-8 text-center">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h1 className="text-lg font-medium text-gray-900 mb-1">
                Transfer Not Found
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                The transfer you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate('/products/transfers')}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Back to Transfers
              </button>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/products/transfers')}
                className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-medium text-gray-900">
                  Transfer #{transfer._id.slice(-8)}
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  Created {new Date(transfer.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <StatusMenus 
              currentLabel={transfer.status.replace(/_/g, ' ')} 
              transferId={transfer._id}
              onDeleteClick={() => setDeleteDialogOpen(true)}
              onCancelClick={() => setCancelDialogOpen(true)}
              isCancelled={transfer.status === 'cancelled'}
              status={transfer.status}
              onReadyClick={() => setReadyDialogOpen(true)}
              onCreateShipment={() => navigate(`/products/transfers/${transfer._id}/shipment/new`, { state: { transferId: transfer._id, entries } })}
              hasShipment={!!shipment}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Cancelled State Banner */}
          {transfer.status === 'cancelled' && (
            <div className="border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <div>
                  <h2 className="text-sm font-medium text-red-900 mb-0.5">
                    Transfer Cancelled
                  </h2>
                  <p className="text-xs text-red-700">
                    This transfer has been cancelled and cannot be modified. You can view the details but no actions are available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shipment Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Shipment</h2>
            {shipmentsLoading ? (
              <p className="text-sm text-gray-600">Loading shipment...</p>
            ) : shipment ? (
              <div className="border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Scheduled for {shipment.carrier || '—'} delivery for {shipment.estimatedArrivalDate ? new Date(shipment.estimatedArrivalDate).toLocaleDateString() : '—'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Tracking number: <span className="font-medium">{shipment.trackingNumber || '—'}</span>
                </p>
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                  {shipment.status.replace('_', ' ')}
                </span>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {shipment.status === 'in_transit' ? (
                    <button
                      onClick={() => navigate(`/products/transfers/${transfer._id}/shipment/${shipment._id}/receive`)}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                      Receive shipment
                    </button>
                  ) : shipment.status === 'received' ? null : (
                    <>
                      <button
                        onClick={() => {
                          setEditTrackingNumber(shipment.trackingNumber || '');
                          setEditCarrier(shipment.carrier || '');
                          setEditEta(shipment.estimatedArrivalDate ? shipment.estimatedArrivalDate.slice(0,10) : '');
                          setEditShipmentOpen(true);
                        }}
                        className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Edit tracking
                      </button>
                      <button
                        onClick={() => setDeleteShipmentOpen(true)}
                        className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-red-600"
                      >
                        Delete shipment
                      </button>
                      <button
                        onClick={() => setInTransitDialogOpen(true)}
                        className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                      >
                        Mark as in transit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-600">No shipment created yet.</p>
              </div>
            )}
          </div>

          {/* Locations Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Transfer Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">Origin Location</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {transfer.originLocationId?.name}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  {transfer.originLocationId?.address}
                </p>
                <p className="text-xs text-gray-600">
                  {transfer.originLocationId?.city}, {transfer.originLocationId?.state} {transfer.originLocationId?.postalCode}
                </p>
              </div>
              <div className="border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">Destination Location</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {transfer.destinationLocationId?.name}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  {transfer.destinationLocationId?.address}
                </p>
                <p className="text-xs text-gray-600">
                  {transfer.destinationLocationId?.city}, {transfer.destinationLocationId?.state} {transfer.destinationLocationId?.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Entries Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Transfer Entries</h2>
            <div className="border border-gray-200 bg-gray-50 p-3">
              {entriesLoading && (
                <p className="text-sm text-gray-600">Loading entries...</p>
              )}
              {entriesError && (
                <p className="text-sm text-red-600">{entriesError}</p>
              )}
              {!entriesLoading && !entriesError && (
                entries.length ? (
                  <div className="border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Products</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">SKU</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">At origin</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map(e => (
                          <tr key={e._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                {e.variantId.images?.[0] ? (
                                  <img
                                    src={e.variantId.images[0]}
                                    alt={e.variantId.productName || 'Product'}
                                    className="w-10 h-10 object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {e.variantId.productName || 'Unnamed product'}
                                  </p>
                                  {!!Object.keys(e.variantId.optionValues || {}).length && (
                                    <p className="text-xs text-gray-600">
                                      {Object.entries(e.variantId.optionValues).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {e.variantId.sku}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {typeof (e as any).atOrigin === 'number' ? (e as any).atOrigin : 0}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                              {e.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <CubeIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">
                      No entries added to this transfer
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Transfer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-1 mb-2">
                  <BuildingStorefrontIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Reference Name</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {transfer.referenceName || 'No reference'}
                </p>
              </div>
              <div className="border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-1 mb-2">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Transfer Date</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : 'Not set'}
                </p>
                {transfer.transferDate && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(transfer.transferDate).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-1 mb-2">
                  <BuildingStorefrontIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Store ID</p>
                </div>
                <p className="text-sm font-medium text-gray-900 font-mono">
                  {transfer.storeId}
                </p>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Transfer Tags</h2>
            <div className="border border-gray-200 bg-gray-50 p-3 min-h-[80px] flex items-center">
              {transfer.tags?.length ? (
                <div className="flex flex-wrap gap-1">
                  {transfer.tags.map(tag => (
                    <span
                      key={tag._id}
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center w-full">
                  <TagIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">
                    No tags assigned to this transfer
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="border border-gray-200 p-4 bg-white/95">
            <h2 className="text-base font-medium text-gray-900 mb-3">Transfer Notes</h2>
            <div className="border border-gray-200 bg-gray-50 p-3 min-h-[100px]">
              {transfer.note ? (
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {transfer.note}
                </p>
              ) : (
                <div className="text-center py-2">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">
                    No notes added to this transfer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title={
            <div className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Delete Transfer</span>
            </div>
          }
          actions={
            <>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleDeleteTransfer}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Yes, Delete Transfer
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-900 mb-2">
            Do you really want to delete this transfer?
          </p>
          <div className="p-2 bg-red-50 border border-red-200 mb-2">
            <p className="text-xs text-red-600 font-medium">
              Transfer ID: {transfer?._id}
            </p>
          </div>
          <p className="text-xs text-gray-600">
            This action cannot be undone. The transfer and all its associated entries will be permanently deleted.
          </p>
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
              <span>Cancel Transfer</span>
            </div>
          }
          actions={
            <>
              <button
                onClick={() => setCancelDialogOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                No, Keep Transfer
              </button>
              <button
                onClick={handleCancelTransfer}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Yes, Cancel Transfer
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-900 mb-2">
            Are you sure you want to cancel this transfer?
          </p>
          <div className="p-2 bg-gray-50 border border-gray-200 mb-2">
            <p className="text-xs text-gray-600 font-medium">
              Transfer ID: {transfer?._id}
            </p>
          </div>
          <p className="text-xs text-gray-600">
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
                onClick={() => setReadyDialogOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReadyToShip}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Confirm
              </button>
            </>
          }
        >
          <p className="text-sm font-medium text-gray-900 mb-2">
            Mark as ready to ship
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Marking the transfer as ready to ship will automatically reserve all inventory and stock all unavailable items at the shop location.
          </p>
          <div className="p-3 bg-gray-50 border border-gray-200 mb-3">
            <p className="text-xs text-gray-600">
              Origin: <span className="font-medium">{transfer.originLocationId?.name}</span>
            </p>
            <p className="text-xs text-gray-600">
              Destination: <span className="font-medium">{transfer.destinationLocationId?.name}</span>
            </p>
          </div>
          <div className="p-3 bg-white border border-gray-200">
            <p className="text-xs font-medium text-gray-900 mb-2">What happens next</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
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
                onClick={() => setEditShipmentOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!shipment) return;
                  await updateShipment(shipment._id, {
                    trackingNumber: editTrackingNumber,
                    carrier: editCarrier,
                    estimatedArrivalDate: editEta || undefined
                  });
                  setEditShipmentOpen(false);
                }}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Tracking number</label>
              <input
                type="text"
                value={editTrackingNumber}
                onChange={(e) => setEditTrackingNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Shipping carrier</label>
              <input
                type="text"
                value={editCarrier}
                onChange={(e) => setEditCarrier(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Estimated arrival date</label>
              <input
                type="date"
                value={editEta}
                onChange={(e) => setEditEta(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
        </Modal>

        {/* Delete Shipment Confirmation Modal */}
        <Modal
          open={deleteShipmentOpen}
          onClose={() => setDeleteShipmentOpen(false)}
          title={<span className="text-red-600">Delete shipment</span>}
          actions={
            <>
              <button
                onClick={() => setDeleteShipmentOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!shipment) return;
                  await deleteShipment(shipment._id);
                  setDeleteShipmentOpen(false);
                }}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-900">Are you sure you want to delete this shipment?</p>
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
                onClick={() => setInTransitDialogOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
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
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Mark as in transit
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-900 mb-3">
            Are you sure you want to mark this transfer as in transit? These units will be marked as incoming to the destination and allowed to be received.
          </p>
          <div className="p-3 bg-gray-50 border border-gray-200 mb-3">
            <p className="text-xs text-gray-600">Origin: <span className="font-medium">{transfer.originLocationId?.name}</span></p>
            <p className="text-xs text-gray-600">Destination: <span className="font-medium">{transfer.destinationLocationId?.name}</span></p>
            <p className="text-xs text-gray-600">Total units: <span className="font-medium">{entries.reduce((sum, e) => sum + (e.quantity || 0), 0)}</span></p>
          </div>
          <div className="p-3 bg-white border border-gray-200">
            <p className="text-xs font-medium text-gray-900 mb-2">What happens next</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
              <li>Origin: unavailable decreases by the transfer quantity.</li>
              <li>Destination: incoming increases by the transfer quantity.</li>
              <li>Transfer status changes to <span className="font-medium">in progress</span>.</li>
              <li>Shipment status changes to <span className="font-medium">in transit</span>.</li>
            </ul>
          </div>
        </Modal>
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
}> = ({ currentLabel, transferId, onDeleteClick, onCancelClick, onReadyClick, onCreateShipment, isCancelled, status, hasShipment }) => {
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
      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 capitalize">
        {currentLabel}
      </span>
      {isReady && !hasShipment && (
        <button
          onClick={onCreateShipment}
          className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Create shipment
        </button>
      )}
      {isDraft && (
        <>
          <div className="relative" ref={markMenuRef}>
            <button
              disabled={isCancelled}
              onClick={() => setIsMarkMenuOpen(!isMarkMenuOpen)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Mark as
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {isMarkMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg z-10">
                {isDraft && (
                  <button
                    onClick={() => {
                      setIsMarkMenuOpen(false);
                      onReadyClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Ready to ship
                  </button>
                )}
                <button
                  onClick={() => setIsMarkMenuOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  In progress
                </button>
                <button
                  onClick={() => setIsMarkMenuOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Transferred
                </button>
              </div>
            )}
          </div>
          <div className="relative" ref={moreMenuRef}>
            <button
              disabled={isCancelled}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
            >
              More actions
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg z-10">
                {!isCancelled && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onCancelClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Cancel transfer
                  </button>
                )}
                {isDraft && !isCancelled && !isReady && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onDeleteClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
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
