import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OrderDetailsHeader from '../components/order/OrderDetailsHeader';
import OrderDetailsSidebar from '../components/order/OrderDetailsSidebar';
import OrderFulfillmentCard from '../components/order/OrderFulfillmentCard';
import OrderPaymentCard from '../components/order/OrderPaymentCard';
import OrderTimelineSection from '../components/order/OrderTimelineSection';
import { useAdminOrders } from '../contexts/admin-order.context';
import type { AdminOrder, AdminOrderItem } from '../contexts/admin-order.context';
import { useOrderTimeline } from '../contexts/order-timeline.context';
import { useStore } from '../contexts/store.context';
import { useUserContext } from '../contexts/user.context';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { orders, getOrderById, getOrdersByStoreId, verifyOrderPayment } = useAdminOrders();
  const { loggedInUser } = useUserContext();
  const {
    timelineEntries,
    loading: timelineLoading,
    error: timelineError,
    getTimelineByOrderId,
    createTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
    clearTimelineEntries,
  } = useOrderTimeline();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [timelineToDelete, setTimelineToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const userInitials = useMemo(() => {
    const name = loggedInUser?.name?.trim() || loggedInUser?.email || 'ST';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [loggedInUser?.email, loggedInUser?.name]);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(id);
      setOrder(data);
    } catch {
      setOrder(null);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id, getOrderById]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (activeStoreId) {
      getOrdersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, getOrdersByStoreId]);

  useEffect(() => {
    if (!id) return;
    void getTimelineByOrderId(id);
    return () => {
      clearTimelineEntries();
    };
  }, [id, getTimelineByOrderId, clearTimelineEntries]);

  const sortedStoreOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.orderDate || b.createdAt).getTime() - new Date(a.orderDate || a.createdAt).getTime()
      ),
    [orders]
  );

  const currentOrderIndex = useMemo(
    () => sortedStoreOrders.findIndex((entry) => entry._id === id),
    [id, sortedStoreOrders]
  );

  const customerOrderCount = useMemo(() => {
    if (!order?.customerId?._id) return undefined;
    return orders.filter((entry) => entry.customerId?._id === order.customerId._id).length;
  }, [order?.customerId?._id, orders]);

  const handlePostComment = useCallback(async () => {
    if (!id || !comment.trim()) return;
    setPostingComment(true);
    try {
      await createTimelineEntry({ orderId: id, comment: comment.trim() });
      setComment('');
    } catch {
      // surfaced via context
    } finally {
      setPostingComment(false);
    }
  }, [comment, createTimelineEntry, id]);

  const handleEditTimeline = useCallback((timelineId: string, currentComment: string) => {
    setEditingTimelineId(timelineId);
    setEditComment(currentComment);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingTimelineId || !editComment.trim()) return;
    try {
      await updateTimelineEntry(editingTimelineId, { comment: editComment.trim() });
      setEditingTimelineId(null);
      setEditComment('');
    } catch {
      // surfaced via context
    }
  }, [editComment, editingTimelineId, updateTimelineEntry]);

  const handleCancelEdit = useCallback(() => {
    setEditingTimelineId(null);
    setEditComment('');
  }, []);

  const handleDeleteTimeline = useCallback((timelineId: string) => {
    setTimelineToDelete(timelineId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!timelineToDelete) return;
    try {
      await deleteTimelineEntry(timelineToDelete);
    } catch {
      // surfaced via context
    } finally {
      setTimelineToDelete(null);
      setDeleteDialogOpen(false);
    }
  }, [deleteTimelineEntry, timelineToDelete]);

  const handleCancelDelete = useCallback(() => {
    setTimelineToDelete(null);
    setDeleteDialogOpen(false);
  }, []);

  const getProductIdFromItem = useCallback((item: AdminOrderItem): string | null => {
    const productRef = item?.productVariantId?.productId;
    if (!productRef) return null;
    if (typeof productRef === 'string') return productRef;
    if (typeof productRef === 'object' && typeof productRef._id === 'string') return productRef._id;
    return null;
  }, []);

  const handlePreviousOrder = useCallback(() => {
    if (currentOrderIndex <= 0) return;
    const previous = sortedStoreOrders[currentOrderIndex - 1];
    if (previous?._id) navigate(`/orders/${previous._id}`);
  }, [currentOrderIndex, navigate, sortedStoreOrders]);

  const handleNextOrder = useCallback(() => {
    if (currentOrderIndex < 0 || currentOrderIndex >= sortedStoreOrders.length - 1) return;
    const next = sortedStoreOrders[currentOrderIndex + 1];
    if (next?._id) navigate(`/orders/${next._id}`);
  }, [currentOrderIndex, navigate, sortedStoreOrders]);

  const handleVerifyPayment = useCallback(async () => {
    if (!id) return;
    const updatedOrder = await verifyOrderPayment(id);
    setOrder(updatedOrder);
  }, [id, verifyOrderPayment]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-background-color">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
          <p className="mt-3 text-sm text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-background-color">
        <div className="text-center">
          <p className="text-sm text-red-600">{error || 'Order not found'}</p>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="mt-4 text-sm font-medium text-blue-700 hover:underline"
          >
            Back to orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6">
        <OrderDetailsHeader
          order={order}
          onBack={() => navigate('/orders')}
          onPrevious={handlePreviousOrder}
          onNext={handleNextOrder}
          hasPrevious={currentOrderIndex > 0}
          hasNext={currentOrderIndex >= 0 && currentOrderIndex < sortedStoreOrders.length - 1}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="min-w-0 space-y-4">
            <OrderFulfillmentCard order={order} getProductIdFromItem={getProductIdFromItem} />
            <OrderPaymentCard order={order} onVerifyPayment={handleVerifyPayment} />
            <OrderTimelineSection
              comment={comment}
              userInitials={userInitials}
              onCommentChange={setComment}
              onPostComment={() => void handlePostComment()}
              posting={postingComment}
              timelineEntries={timelineEntries}
              timelineLoading={timelineLoading}
              timelineError={timelineError}
              editingTimelineId={editingTimelineId}
              editComment={editComment}
              onEditCommentChange={setEditComment}
              onEditTimeline={handleEditTimeline}
              onDeleteTimeline={handleDeleteTimeline}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={() => void handleSaveEdit()}
              deleteDialogOpen={deleteDialogOpen}
              onConfirmDelete={() => void handleConfirmDelete()}
              onCancelDelete={handleCancelDelete}
            />
          </div>

          <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
            <OrderDetailsSidebar order={order} customerOrderCount={customerOrderCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
