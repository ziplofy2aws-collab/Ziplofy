import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AbandonedCartCustomerInfo from '../../components/orders/AbandonedCartCustomerInfo';
import AbandonedCartDetailsBreadcrumbs from '../../components/orders/AbandonedCartDetailsBreadcrumbs';
import AbandonedCartItemsTable from '../../components/orders/AbandonedCartItemsTable';
import AbandonedCartSummary from '../../components/orders/AbandonedCartSummary';
import SendRecoveryEmailModal from '../../components/orders/SendRecoveryEmailModal';
import { useAbandonedCarts } from '../../contexts/abandoned-cart.context';
import { useStore } from '../../contexts/store.context';
import { buildRecoveryEmailTemplate } from '../../utils/recovery-email-templates';

const AbandonedCartDetailsPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { abandonedCarts, loading, error, fetchAbandonedCartsByStoreId } = useAbandonedCarts();
  const { activeStoreId } = useStore();

  const [selectedCart, setSelectedCart] = useState<any>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('custom');

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getInitials = useCallback((firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
      const template = buildRecoveryEmailTemplate('custom', customer.firstName);
      setEmailTemplate('custom');
      setEmailSubject(template.subject);
      setEmailBody(template.bodyHtml);
      setIsEmailModalOpen(true);
    }
  }, [selectedCart]);

  const handleCloseEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
    setEmailSubject('');
    setEmailBody('');
    setEmailTemplate('custom');
  }, []);

  const handleSendEmailSubmit = useCallback(() => {
    console.log('Sending email to:', selectedCart?.customer?.email);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('Template:', emailTemplate);
    handleCloseEmailModal();
  }, [selectedCart?.customer?.email, emailSubject, emailBody, emailTemplate, handleCloseEmailModal]);

  const handleTemplateChange = useCallback(
    (template: string) => {
      setEmailTemplate(template);

      if (!selectedCart?.customer) return;
      const next = buildRecoveryEmailTemplate(template, selectedCart.customer.firstName);
      setEmailSubject(next.subject);
      setEmailBody(next.bodyHtml);
    },
    [selectedCart?.customer]
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
        <div className="mx-auto flex min-h-[50vh] max-w-[1440px] items-center justify-center px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200/80 bg-white px-10 py-12 shadow-sm">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
              aria-hidden
            />
            <p className="text-sm font-medium text-gray-600">Loading cart details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl border border-red-200/90 bg-linear-to-br from-red-50/80 to-white p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-red-900">Couldn&apos;t load cart</h2>
              <p className="mt-1 text-sm text-red-800/90">{error}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRetryFetch}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  Back to abandoned carts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCart) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Abandoned carts
          </button>
          <div className="flex flex-col items-center rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-sm sm:py-20">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
              <ShoppingCartIcon className="h-8 w-8 text-gray-400" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Cart not found</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              This abandoned cart is no longer available or the link may be incorrect. Return to the list to pick
              another customer.
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="mt-8 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              View all abandoned carts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 space-y-5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Abandoned carts
          </button>
          <AbandonedCartDetailsBreadcrumbs
            customerFirstName={selectedCart.customer.firstName}
            customerLastName={selectedCart.customer.lastName}
          />
        </header>

        <section className="mb-8 rounded-2xl border border-gray-200/80 bg-linear-to-b from-white to-blue-50/25 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg ring-4 ring-blue-100">
                {getInitials(selectedCart.customer.firstName, selectedCart.customer.lastName)}
              </div>
              <div className="min-w-0 border-l-4 border-blue-500/70 pl-4">
                <button
                  type="button"
                  onClick={() => handleViewCustomer(selectedCart.customer._id)}
                  className="text-left text-2xl font-semibold tracking-tight text-gray-900 transition-colors hover:text-blue-700 hover:underline sm:text-3xl"
                >
                  {selectedCart.customer.firstName} {selectedCart.customer.lastName}
                </button>
                <p className="mt-1 truncate text-sm text-gray-500 sm:text-base">{selectedCart.customer.email}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Last cart activity · {formatDate(selectedCart.lastUpdated)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700 lg:w-auto"
            >
              <PaperAirplaneIcon className="h-4 w-4" aria-hidden />
              Send recovery email
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="space-y-5 lg:col-span-4 lg:space-y-6">
            <AbandonedCartCustomerInfo
              customer={selectedCart.customer}
              getInitials={getInitials}
              onViewCustomer={handleViewCustomer}
            />
            <AbandonedCartSummary
              totalItems={selectedCart.totalItems}
              uniqueProducts={selectedCart.cartItems.length}
              totalValue={calculateCartTotal()}
              lastUpdated={selectedCart.lastUpdated}
              formatDate={formatDate}
            />
          </aside>

          <div className="lg:col-span-8">
            <AbandonedCartItemsTable
              cartItems={selectedCart.cartItems}
              cartTotal={calculateCartTotal()}
              onViewProduct={handleViewProduct}
            />
          </div>
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
      />
    </div>
  );
};

export default AbandonedCartDetailsPage;
