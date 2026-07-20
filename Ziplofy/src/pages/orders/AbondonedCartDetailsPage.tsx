import { ChevronLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AbandonedCartCustomerInfo from '../../components/orders/AbandonedCartCustomerInfo';
import AbandonedCartItemsTable from '../../components/orders/AbandonedCartItemsTable';
import AbandonedCartSummary from '../../components/orders/AbandonedCartSummary';
import SendRecoveryEmailModal from '../../components/orders/SendRecoveryEmailModal';
import { useAbandonedCarts } from '../../contexts/abandoned-cart.context';
import { useStore } from '../../contexts/store.context';
import { buildRecoveryEmailTemplate } from '../../utils/recovery-email-templates';
import { sendAbandonedCartRecoveryEmail } from '../../utils/send-abandoned-cart-recovery-email';

const AbandonedCartDetailsPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { abandonedCarts, loading, error, fetchAbandonedCartsByStoreId } = useAbandonedCarts();
  const { activeStoreId, stores } = useStore();

  const [selectedCart, setSelectedCart] = useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('custom');
  const [sendingEmail, setSendingEmail] = useState(false);

  const storeName = useMemo(() => {
    if (!activeStoreId) return 'Your Store';
    return stores.find((s) => s._id === activeStoreId)?.storeName?.trim() || 'Your Store';
  }, [activeStoreId, stores]);

  useEffect(() => {
    if (activeStoreId) {
      fetchAbandonedCartsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchAbandonedCartsByStoreId]);

  useEffect(() => {
    if (abandonedCarts.length > 0 && customerId) {
      const cart = abandonedCarts.find((c) => c.customer._id === customerId);
      setSelectedCart(cart ?? null);
    } else if (!loading && abandonedCarts.length === 0) {
      setSelectedCart(null);
    }
  }, [abandonedCarts, customerId, loading]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const calculateCartTotal = useCallback(() => {
    if (!selectedCart) return 0;
    return selectedCart.cartItems.reduce((total: number, item: any) => {
      return total + item.productVariant.price * item.quantity;
    }, 0);
  }, [selectedCart]);

  const handleSendEmail = useCallback(() => {
    if (selectedCart?.customer) {
      const customer = selectedCart.customer;
      const template = buildRecoveryEmailTemplate('custom', customer.firstName, storeName);
      setEmailTemplate('custom');
      setEmailSubject(template.subject);
      setEmailBody(template.bodyHtml);
      setIsEmailModalOpen(true);
    }
  }, [selectedCart, storeName]);

  const handleCloseEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
    setEmailSubject('');
    setEmailBody('');
    setEmailTemplate('custom');
  }, []);

  const handleSendEmailSubmit = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('No active store selected');
      return;
    }

    try {
      setSendingEmail(true);
      await sendAbandonedCartRecoveryEmail({
        storeId: activeStoreId,
        storeName,
        customerFirstName: selectedCart?.customer?.firstName,
        subject: emailSubject,
        bodyHtml: emailBody,
      });
      toast.success('Recovery email sent');
      handleCloseEmailModal();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send recovery email';
      toast.error(message);
    } finally {
      setSendingEmail(false);
    }
  }, [
    activeStoreId,
    storeName,
    selectedCart?.customer?.firstName,
    emailSubject,
    emailBody,
    handleCloseEmailModal,
  ]);

  const handleTemplateChange = useCallback(
    (template: string) => {
      setEmailTemplate(template);
      if (!selectedCart?.customer) return;
      const next = buildRecoveryEmailTemplate(template, selectedCart.customer.firstName, storeName);
      setEmailSubject(next.subject);
      setEmailBody(next.bodyHtml);
    },
    [selectedCart?.customer, storeName]
  );

  const handleBack = useCallback(() => {
    navigate('/orders/abandoned-carts');
  }, [navigate]);

  const handleViewCustomer = useCallback(
    (id: string) => {
      navigate(`/customers/${id}`);
    },
    [navigate]
  );

  const handleRetryFetch = useCallback(() => {
    if (activeStoreId) {
      fetchAbandonedCartsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchAbandonedCartsByStoreId]);

  const handleViewProduct = useCallback(
    (productId: string) => {
      navigate(`/products/${productId}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto flex min-h-[360px] max-w-[1400px] items-center justify-center px-3 py-4 sm:px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <p className="text-[13px] text-red-600">{error}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleRetryFetch}
                className="text-[13px] font-medium text-gray-900 hover:underline"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="text-[13px] text-gray-500 hover:text-gray-700"
              >
                Back to abandoned carts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCart) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-1 text-[13px] text-gray-600 transition-colors hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
            Abandoned carts
          </button>
          <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <ShoppingCartIcon className="h-7 w-7 text-gray-400" aria-hidden />
              </div>
              <p className="text-[15px] font-semibold text-gray-900">Cart not found</p>
              <p className="mt-1.5 max-w-md text-[13px] text-gray-500">
                This abandoned cart is no longer available or the link may be incorrect.
              </p>
              <button
                type="button"
                onClick={handleBack}
                className="mt-6 rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                View all abandoned carts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const customerName = `${selectedCart.customer.firstName} ${selectedCart.customer.lastName}`.trim();

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-gray-600 transition-colors hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          Abandoned carts
        </button>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900">{customerName}</h1>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {selectedCart.customer.email} · Last activity {formatDate(selectedCart.lastUpdated)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendEmail}
            className="inline-flex shrink-0 items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
          >
            Send recovery email
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start">
          <AbandonedCartItemsTable
            cartItems={selectedCart.cartItems}
            cartTotal={calculateCartTotal()}
            onViewProduct={handleViewProduct}
          />

          <div className="space-y-4">
            <AbandonedCartCustomerInfo
              customer={selectedCart.customer}
              onViewCustomer={handleViewCustomer}
            />
            <AbandonedCartSummary
              totalItems={selectedCart.totalItems}
              uniqueProducts={selectedCart.cartItems.length}
              totalValue={calculateCartTotal()}
              lastUpdated={selectedCart.lastUpdated}
              formatDate={formatDate}
            />
          </div>
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Learn more about abandoned carts
            </a>
          </p>
        </div>
      </div>

      <SendRecoveryEmailModal
        isOpen={isEmailModalOpen}
        customer={selectedCart?.customer || null}
        emailSubject={emailSubject}
        emailBody={emailBody}
        emailTemplate={emailTemplate}
        onClose={handleCloseEmailModal}
        onTemplateChange={handleTemplateChange}
        onSubjectChange={setEmailSubject}
        onBodyChange={setEmailBody}
        onSubmit={handleSendEmailSubmit}
        sending={sendingEmail}
      />
    </div>
  );
};

export default AbandonedCartDetailsPage;
