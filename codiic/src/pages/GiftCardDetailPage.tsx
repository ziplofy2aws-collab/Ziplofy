import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeactivateGiftCardModal from '../components/gift-card/DeactivateGiftCardModal';
import EditGiftCardModal from '../components/gift-card/EditGiftCardModal';
import GiftCardDetailHeader from '../components/gift-card/GiftCardDetailHeader';
import GiftCardDisplay from '../components/gift-card/GiftCardDisplay';
import GiftCardInformationPanel from '../components/gift-card/GiftCardInformationPanel';
import GiftCardNotesSection from '../components/gift-card/GiftCardNotesSection';
import GiftCardTimelineSection from '../components/gift-card/GiftCardTimelineSection';
import { useGiftCardTimeline } from '../contexts/gift-card-timeline.context';
import { useGiftCards } from '../contexts/gift-cards.context';
import { useStore } from '../contexts/store.context';


const GiftCardDetailPage: React.FC = () => {
  const { giftCardId } = useParams<{ giftCardId: string }>();
  const navigate = useNavigate();
  const { giftCards, loading, error, fetchGiftCardsByStoreId, updateGiftCard } = useGiftCards();
  const { activeStoreId } = useStore();
  const {
    timelineEntries,
    loading: timelineLoading,
    error: timelineError,
    getTimelineByGiftCardId,
    deleteTimelineEntry,
    createTimelineEntry,
    updateTimelineEntry
  } = useGiftCardTimeline();

  // Find the specific gift card from the context state
  const giftCard = useMemo(() => giftCards.find((card) => card._id === giftCardId), [giftCards, giftCardId]);
  
  const [comment, setComment] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [timelineToDelete, setTimelineToDelete] = useState<string | null>(null);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState<string>('');

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [expirationOption, setExpirationOption] = useState<'no-expiration' | 'set-expiration'>('no-expiration');
  const [newExpirationDate, setNewExpirationDate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Notes edit states
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState<boolean>(false);

  // Deactivate confirmation states
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState<boolean>(false);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Fetch gift cards if not already loaded
  useEffect(() => {
    if (activeStoreId && giftCards.length === 0) {
      fetchGiftCardsByStoreId(activeStoreId);
    }
  }, [activeStoreId, giftCards.length, fetchGiftCardsByStoreId]);

  // Fetch timeline entries when gift card ID is available
  useEffect(() => {
    if (giftCardId) {
      getTimelineByGiftCardId(giftCardId);
    }
  }, [giftCardId, getTimelineByGiftCardId]);

  const handleBack = useCallback(() => {
    navigate('/products/gift-cards');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    // Initialize modal state based on current gift card
    if (giftCard?.expirationDate) {
      setExpirationOption('set-expiration');
      setNewExpirationDate(giftCard.expirationDate.split('T')[0]); // Convert to YYYY-MM-DD format
    } else {
      setExpirationOption('no-expiration');
      setNewExpirationDate('');
    }
    setEditModalOpen(true);
  }, [giftCard]);

  const handleDeactivate = useCallback(() => {
    setDeactivateDialogOpen(true);
  }, []);

  const handleDeleteTimeline = useCallback((timelineId: string) => {
    setTimelineToDelete(timelineId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteTimeline = useCallback(async () => {
    if (timelineToDelete) {
      try {
        await deleteTimelineEntry(timelineToDelete);
        setDeleteDialogOpen(false);
        setTimelineToDelete(null);
      } catch (error) {
        console.error('Error deleting timeline entry:', error);
      }
    }
  }, [timelineToDelete, deleteTimelineEntry]);

  const cancelDeleteTimeline = useCallback(() => {
    setDeleteDialogOpen(false);
    setTimelineToDelete(null);
  }, []);

  const handlePostComment = useCallback(async () => {
    if (!comment.trim() || !giftCardId) return;

    try {
      await createTimelineEntry({
        giftCardId,
        comment: comment.trim()
      });
      setComment(''); // Clear the input after successful post
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  }, [comment, giftCardId, createTimelineEntry]);

  const handleEditTimeline = useCallback((timelineId: string, currentComment: string) => {
    setEditingTimelineId(timelineId);
    setEditComment(currentComment);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingTimelineId || !editComment.trim()) return;

    try {
      await updateTimelineEntry(editingTimelineId, {
        comment: editComment.trim()
      });
      setEditingTimelineId(null);
      setEditComment('');
    } catch (error) {
      console.error('Error updating timeline entry:', error);
    }
  }, [editingTimelineId, editComment, updateTimelineEntry]);

  const handleCancelEdit = useCallback(() => {
    setEditingTimelineId(null);
    setEditComment('');
  }, []);

  // Edit modal handlers
  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setExpirationOption('no-expiration');
    setNewExpirationDate('');
    setIsUpdating(false);
  }, []);

  const handleExpirationOptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setExpirationOption(event.target.value as 'no-expiration' | 'set-expiration');
    if (event.target.value === 'no-expiration') {
      setNewExpirationDate('');
    }
  }, []);

  const handleSaveGiftCardEdit = useCallback(async () => {
    if (!giftCard) return;

    setIsUpdating(true);
    try {
      let updatePayload: any = {};

      if (expirationOption === 'no-expiration') {
        // Remove expiration date
        updatePayload.expirationDate = undefined;
      } else {
        // Set new expiration date
        if (newExpirationDate) {
          updatePayload.expirationDate = new Date(newExpirationDate).toISOString();
        }
      }

      // Only update if there's actually a change
      const currentExpiration = giftCard.expirationDate ? giftCard.expirationDate.split('T')[0] : null;
      const newExpiration = expirationOption === 'no-expiration' ? null : newExpirationDate;

      if (currentExpiration !== newExpiration) {
        await updateGiftCard(giftCard._id, updatePayload);
        handleCloseEditModal();
      } else {
        // No changes made, just close the modal
        handleCloseEditModal();
      }
    } catch (error) {
      console.error('Error updating gift card:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [giftCard, expirationOption, newExpirationDate, updateGiftCard, handleCloseEditModal]);

  // Check if there are changes to enable/disable the Done button
  const hasChanges = useCallback(() => {
    if (!giftCard) return false;

    const currentExpiration = giftCard.expirationDate ? giftCard.expirationDate.split('T')[0] : null;
    const newExpiration = expirationOption === 'no-expiration' ? null : newExpirationDate;

    return currentExpiration !== newExpiration;
  }, [giftCard, expirationOption, newExpirationDate]);

  // Notes edit handlers
  const handleEditNotes = useCallback(() => {
    setEditedNotes(giftCard?.notes || '');
    setIsEditingNotes(true);
  }, [giftCard]);

  const handleCancelEditNotes = useCallback(() => {
    setEditedNotes('');
    setIsEditingNotes(false);
  }, []);

  const handleSaveNotes = useCallback(async () => {
    if (!giftCard) return;

    setIsUpdatingNotes(true);
    try {
      await updateGiftCard(giftCard._id, { notes: editedNotes });
      setIsEditingNotes(false);
      setEditedNotes('');
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setIsUpdatingNotes(false);
    }
  }, [giftCard, editedNotes, updateGiftCard]);

  // Deactivate confirmation handlers
  const handleCancelDeactivate = useCallback(() => {
    setDeactivateDialogOpen(false);
  }, []);

  const handleConfirmDeactivate = useCallback(async () => {
    if (!giftCard) return;

    setIsDeactivating(true);
    try {
      await updateGiftCard(giftCard._id, { isActive: false });
      setDeactivateDialogOpen(false);
    } catch (error) {
      console.error('Error deactivating gift card:', error);
    } finally {
      setIsDeactivating(false);
    }
  }, [giftCard, updateGiftCard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-background-color flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Gift Cards
          </button>
        </div>
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm mb-4">
            Gift card not found
          </div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Gift Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <GiftCardDetailHeader
          onBack={handleBack}
          onDeactivate={handleDeactivate}
          isActive={giftCard.isActive}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {/* Gift Card Display */}
          <GiftCardDisplay giftCard={giftCard} onEdit={handleEdit} />

          {/* Gift Card Information */}
          <GiftCardInformationPanel giftCard={giftCard} />

          {/* Notes Section */}
          <GiftCardNotesSection
            giftCard={giftCard}
            isEditingNotes={isEditingNotes}
            editedNotes={editedNotes}
            isUpdatingNotes={isUpdatingNotes}
            onEditNotes={handleEditNotes}
            onCancelEditNotes={handleCancelEditNotes}
            onSaveNotes={handleSaveNotes}
            onNotesChange={setEditedNotes}
          />
        </div>

        {/* Timeline Segment */}
        <GiftCardTimelineSection
          comment={comment}
          onCommentChange={setComment}
          onPostComment={handlePostComment}
          timelineEntries={timelineEntries}
          timelineLoading={timelineLoading}
          timelineError={timelineError}
          editingTimelineId={editingTimelineId}
          editComment={editComment}
          onEditCommentChange={setEditComment}
          onEditTimeline={handleEditTimeline}
          onDeleteTimeline={handleDeleteTimeline}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          deleteDialogOpen={deleteDialogOpen}
          onConfirmDelete={confirmDeleteTimeline}
          onCancelDelete={cancelDeleteTimeline}
        />
      </div>

      {/* Edit Gift Card Modal */}
      <EditGiftCardModal
        isOpen={editModalOpen}
        giftCard={giftCard}
        expirationOption={expirationOption}
        newExpirationDate={newExpirationDate}
        isUpdating={isUpdating}
        onClose={handleCloseEditModal}
        onExpirationOptionChange={handleExpirationOptionChange}
        onExpirationDateChange={setNewExpirationDate}
        onSave={handleSaveGiftCardEdit}
        hasChanges={hasChanges}
      />

      {/* Deactivate Confirmation Dialog */}
      <DeactivateGiftCardModal
        isOpen={deactivateDialogOpen}
        isDeactivating={isDeactivating}
        onCancel={handleCancelDeactivate}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
};

export default GiftCardDetailPage;
