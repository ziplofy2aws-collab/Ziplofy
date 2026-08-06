import { Squares2X2Icon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
} from '../components/admin-list-ui';
import CreateSegmentModal from '../components/segments/CreateSegmentModal';
import CustomerSegmentsPageFilters from '../components/segments/CustomerSegmentsPageFilters';
import CustomerSegmentsPageHeader from '../components/segments/CustomerSegmentsPageHeader';
import CustomerSegmentsTable from '../components/segments/CustomerSegmentsTable';
import EditSegmentModal from '../components/segments/EditSegmentModal';
import { useCustomerSegments } from '../contexts/customer-segment.context';
import { useStore } from '../contexts/store.context';

const CustomersSegmentsPage: React.FC = () => {
  const {
    segments,
    createCustomerSegment,
    fetchSegmentsByStoreId,
    updateCustomerSegmentName,
    loading,
    error,
  } = useCustomerSegments();
  const { activeStoreId } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const storeId = useMemo(() => activeStoreId || '', [activeStoreId]);

  const sortedSegments = useMemo(() => {
    return [...segments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [segments, sortOrder]);

  const filteredSegments = useMemo(() => {
    if (!search.trim()) return sortedSegments;
    const q = search.toLowerCase();
    return sortedSegments.filter((s) => s.name.toLowerCase().includes(q));
  }, [sortedSegments, search]);

  useEffect(() => {
    if (storeId) {
      fetchSegmentsByStoreId(storeId).catch(() => {});
    }
  }, [storeId, fetchSegmentsByStoreId]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !storeId) return;
    try {
      await createCustomerSegment(storeId, name.trim());
      setName('');
      setOpen(false);
    } catch {
      // error handled in context
    }
  }, [name, storeId, createCustomerSegment]);

  const handleEdit = useCallback(async () => {
    if (!editName.trim() || !editingId) return;
    try {
      await updateCustomerSegmentName(editingId, editName.trim());
      setEditOpen(false);
    } catch {
      // error handled in context
    }
  }, [editName, editingId, updateCustomerSegmentName]);

  const handleOpenCreateModal = useCallback(() => setOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setOpen(false), []);

  const handleOpenEditModal = useCallback((segmentId: string, segmentName: string) => {
    setEditingId(segmentId);
    setEditName(segmentName);
    setEditOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => setEditOpen(false), []);

  const handleSegmentClick = useCallback(
    (segmentId: string) => navigate(`/customers/segments/${segmentId}`),
    [navigate]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, segmentId: string, segmentName: string) => {
      e.stopPropagation();
      handleOpenEditModal(segmentId, segmentName);
    },
    [handleOpenEditModal]
  );

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handleViewCustomers = useCallback(() => {
    navigate('/customers');
  }, [navigate]);

  const hasSegments = segments.length > 0;

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <CustomerSegmentsPageHeader
          onCreateSegment={handleOpenCreateModal}
          onViewCustomers={handleViewCustomers}
        />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <div className={adminListCardClass}>
          {hasSegments ? (
            <CustomerSegmentsPageFilters search={search} onSearchChange={setSearch} />
          ) : null}

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
              <p className="mt-4 text-[13px] text-admin-text-secondary">Loading segments...</p>
            </div>
          ) : !hasSegments ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-admin-fill">
                <Squares2X2Icon className="h-7 w-7 text-admin-text-subdued" aria-hidden />
              </div>
              <p className="text-[15px] font-semibold text-admin-text">No segments yet</p>
              <p className="mt-1.5 text-[13px] text-admin-text-secondary">
                Create segments to group customers for marketing, reporting, or targeted campaigns.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className={`mt-6 ${adminListPrimaryButtonClass}`}
              >
                Create segment
              </button>
            </div>
          ) : (
            <CustomerSegmentsTable
              segments={filteredSegments}
              sortOrder={sortOrder}
              onSortToggle={handleSortToggle}
              onSegmentClick={handleSegmentClick}
              onEditClick={handleEditClick}
            />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Learn more about customer segments
            </a>
          </p>
        </div>
      </div>

      <CreateSegmentModal
        isOpen={open}
        name={name}
        storeId={storeId}
        onNameChange={setName}
        onClose={handleCloseCreateModal}
        onCreate={handleCreate}
      />
      <EditSegmentModal
        isOpen={editOpen}
        editName={editName}
        onNameChange={setEditName}
        onClose={handleCloseEditModal}
        onSave={handleEdit}
      />
    </div>
  );
};

export default CustomersSegmentsPage;
