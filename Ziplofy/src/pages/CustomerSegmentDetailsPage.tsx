import { UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddCustomerToSegmentModal from '../components/segments/AddCustomerToSegmentModal';
import CustomerSegmentDetailsHeader from '../components/segments/CustomerSegmentDetailsHeader';
import CustomerSegmentEntriesTable from '../components/segments/CustomerSegmentEntriesTable';
import DeleteCustomerFromSegmentModal from '../components/segments/DeleteCustomerFromSegmentModal';
import { segmentPrimaryButtonClass } from '../components/segments/customer-segment-ui.util';
import { useCustomerSegmentEntries } from '../contexts/CustomerSegmentsEntry.context';
import type { Customer } from '../contexts/customer.context';
import { useCustomerSegments } from '../contexts/customer-segment.context';
import { useStore } from '../contexts/store.context';

type SegmentEntry = {
  _id: string;
  customerId: string | {
    _id?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string | Date;
};

const CustomerSegmentDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries, fetchEntriesBySegmentId, createEntry, deleteEntry, loading, error } =
    useCustomerSegmentEntries();
  const { segments, fetchSegmentsByStoreId } = useCustomerSegments();
  const { activeStoreId } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<SegmentEntry | null>(null);

  const segment = useMemo(() => segments.find((s) => s._id === id), [segments, id]);

  const entryCustomerIds = useMemo(() => {
    return entries
      .map((entry) => (typeof entry.customerId === 'string' ? entry.customerId : entry.customerId._id))
      .filter((customerId): customerId is string => !!customerId);
  }, [entries]);

  const canSave = useMemo(() => !!selectedCustomer?._id && !!id, [selectedCustomer, id]);
  const hasEntries = entries.length > 0;

  useEffect(() => {
    if (id) {
      fetchEntriesBySegmentId(id).catch(() => {});
    }
  }, [id, fetchEntriesBySegmentId]);

  useEffect(() => {
    if (activeStoreId && segments.length === 0) {
      fetchSegmentsByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, segments.length, fetchSegmentsByStoreId]);

  const handleBack = useCallback(() => {
    navigate('/customers/segments');
  }, [navigate]);

  const handleOpenAddModal = useCallback(() => {
    setAddOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setAddOpen(false);
    setSelectedCustomer(null);
  }, []);

  const handleAddCustomer = useCallback(async () => {
    if (!id || !selectedCustomer?._id) return;
    try {
      await createEntry(id, selectedCustomer._id);
      setSelectedCustomer(null);
      setAddOpen(false);
    } catch {
      // error handled in context
    }
  }, [id, selectedCustomer, createEntry]);

  const handleDeleteClick = useCallback((entry: SegmentEntry) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setEntryToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!entryToDelete) return;
    try {
      await deleteEntry(entryToDelete._id);
      setDeleteModalOpen(false);
      setEntryToDelete(null);
    } catch {
      // error handled in context
    }
  }, [entryToDelete, deleteEntry]);

  const handleCustomerClick = useCallback(
    (customerId: string) => {
      if (customerId) navigate(`/customers/${customerId}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <CustomerSegmentDetailsHeader
          title={segment?.name || 'Segment details'}
          onBack={handleBack}
          onAddCustomer={handleOpenAddModal}
        />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-[13px] font-semibold text-gray-900">Customers in segment</h2>
            <p className="mt-0.5 text-[12px] font-normal text-gray-500">
              {hasEntries
                ? `${entries.length} customer${entries.length === 1 ? '' : 's'} in this segment`
                : 'Add customers to this segment for targeted marketing and reporting'}
            </p>
          </div>

          {loading && !hasEntries ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
              <p className="mt-4 text-[13px] text-gray-500">Loading customers...</p>
            </div>
          ) : !hasEntries ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <UserGroupIcon className="h-7 w-7 text-gray-400" aria-hidden />
              </div>
              <p className="text-[15px] font-semibold text-gray-900">No customers in this segment yet</p>
              <p className="mt-1.5 text-[13px] text-gray-500">
                Add customers to group them for campaigns and reporting.
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className={`mt-6 ${segmentPrimaryButtonClass}`}
              >
                Add customer
              </button>
            </div>
          ) : (
            <CustomerSegmentEntriesTable
              entries={entries}
              onDelete={handleDeleteClick}
              onCustomerClick={handleCustomerClick}
            />
          )}
        </div>
      </div>

      <AddCustomerToSegmentModal
        isOpen={addOpen}
        onClose={handleCloseAddModal}
        selectedCustomer={selectedCustomer}
        onSelectedCustomerChange={setSelectedCustomer}
        excludeCustomerIds={entryCustomerIds}
        canSave={canSave}
        onSave={handleAddCustomer}
      />

      <DeleteCustomerFromSegmentModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        entry={entryToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default CustomerSegmentDetailsPage;
