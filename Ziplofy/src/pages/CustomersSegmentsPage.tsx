import {
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreateSegmentModal from '../components/segments/CreateSegmentModal';
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editingId, setEditingId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const storeId = useMemo(() => activeStoreId || '', [activeStoreId]);

  const sortedSegments = useMemo(() => {
    const sorted = [...segments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
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
    } catch {}
  }, [name, storeId, createCustomerSegment]);

  const handleEdit = useCallback(async () => {
    if (!editName.trim() || !editingId) return;
    try {
      await updateCustomerSegmentName(editingId, editName.trim());
      setEditOpen(false);
    } catch {}
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

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Customer segments
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Organize customers into groups for targeted marketing and reporting
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/customers"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="w-4 h-4" />
                View customers
              </Link>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create segment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total segments</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{segments.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Squares2X2Icon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <Link
            to="/customers"
            className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:border-blue-200 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="mt-1 text-base font-medium text-blue-600 hover:text-blue-700">
                  Manage customers →
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Segments Table Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search segments by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="mt-4 text-sm text-gray-500">Loading segments...</p>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <p className="text-sm text-red-600">{error}</p>
              {storeId && (
                <button
                  type="button"
                  onClick={() => fetchSegmentsByStoreId(storeId)}
                  className="mt-4 text-sm font-medium text-gray-900 hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Squares2X2Icon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                {search ? 'No segments match your search' : 'No segments yet'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {search
                  ? 'Try a different search term.'
                  : 'Create segments to group customers for marketing, reporting, or targeted campaigns.'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create segment
                </button>
              )}
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
