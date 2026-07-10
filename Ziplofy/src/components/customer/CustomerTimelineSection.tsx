import React, { useCallback, useEffect, useState } from 'react';
import type { CustomerTimelineEntry } from '../../contexts/customer-timeline.context';
import { useCustomerTimeline } from '../../contexts/customer-timeline.context';
import CustomerTimelineComposer from './CustomerTimelineComposer';
import CustomerTimelineList from './CustomerTimelineList';
import DeleteTimelineConfirmModal from './DeleteTimelineConfirmModal';
import EditTimelineModal from './EditTimelineModal';

interface CustomerTimelineSectionProps {
  customerId: string;
}

const CustomerTimelineSection: React.FC<CustomerTimelineSectionProps> = ({ customerId }) => {
  const {
    timeline,
    loading: tlLoading,
    error: tlError,
    createCustomerTimeline,
    updateCustomerTimeline,
    deleteCustomerTimeline,
    fetchCustomerTimelineByCustomerId,
  } = useCustomerTimeline();
  const [timelineComment, setTimelineComment] = useState('');
  const [isDeleteTimelineOpen, setIsDeleteTimelineOpen] = useState(false);
  const [timelineIdToDelete, setTimelineIdToDelete] = useState<string | null>(null);
  const [isEditTimelineOpen, setIsEditTimelineOpen] = useState(false);
  const [timelineIdToEdit, setTimelineIdToEdit] = useState<string | null>(null);
  const [timelineEditComment, setTimelineEditComment] = useState('');

  const handleCreateTimeline = useCallback(async () => {
    if (!customerId || !timelineComment.trim()) return;
    await createCustomerTimeline({ customerId, comment: timelineComment.trim() });
    setTimelineComment('');
    fetchCustomerTimelineByCustomerId(customerId);
  }, [
    customerId,
    timelineComment,
    createCustomerTimeline,
    fetchCustomerTimelineByCustomerId,
  ]);

  const handleEditTimeline = useCallback(async () => {
    if (!timelineIdToEdit || !timelineEditComment.trim() || !customerId) return;
    await updateCustomerTimeline(timelineIdToEdit, { comment: timelineEditComment.trim() });
    setIsEditTimelineOpen(false);
    setTimelineIdToEdit(null);
    setTimelineEditComment('');
    fetchCustomerTimelineByCustomerId(customerId);
  }, [
    timelineIdToEdit,
    timelineEditComment,
    customerId,
    updateCustomerTimeline,
    fetchCustomerTimelineByCustomerId,
  ]);

  const handleDeleteTimeline = useCallback(async () => {
    if (!timelineIdToDelete || !customerId) return;
    await deleteCustomerTimeline(timelineIdToDelete);
    setIsDeleteTimelineOpen(false);
    setTimelineIdToDelete(null);
    fetchCustomerTimelineByCustomerId(customerId);
  }, [timelineIdToDelete, customerId, deleteCustomerTimeline, fetchCustomerTimelineByCustomerId]);

  const handleOpenEditTimeline = useCallback((entry: CustomerTimelineEntry) => {
    setTimelineIdToEdit(entry._id);
    setTimelineEditComment(entry.comment);
    setIsEditTimelineOpen(true);
  }, []);

  // Fetch timeline data when component mounts or customerId changes
  useEffect(() => {
    if (customerId) {
      fetchCustomerTimelineByCustomerId(customerId);
    }
  }, [customerId, fetchCustomerTimelineByCustomerId]);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Timeline</h2>
        <CustomerTimelineList
          timeline={timeline}
          loading={tlLoading}
          error={tlError}
          onEdit={handleOpenEditTimeline}
          onDelete={(entryId) => {
            setTimelineIdToDelete(entryId);
            setIsDeleteTimelineOpen(true);
          }}
        />
        <CustomerTimelineComposer
          comment={timelineComment}
          onCommentChange={setTimelineComment}
          onSubmit={handleCreateTimeline}
        />
      </div>

      {/* Delete Timeline Confirmation Modal */}
      <DeleteTimelineConfirmModal
        isOpen={isDeleteTimelineOpen}
        onClose={() => {
          setIsDeleteTimelineOpen(false);
          setTimelineIdToDelete(null);
        }}
        onConfirm={handleDeleteTimeline}
      />

      {/* Edit Timeline Modal */}
      <EditTimelineModal
        isOpen={isEditTimelineOpen}
        comment={timelineEditComment}
        onCommentChange={setTimelineEditComment}
        onClose={() => {
          setIsEditTimelineOpen(false);
          setTimelineIdToEdit(null);
          setTimelineEditComment('');
        }}
        onSubmit={handleEditTimeline}
      />
    </>
  );
};

export default CustomerTimelineSection;

