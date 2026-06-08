import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AbandonedCartsEmptyState from '../../components/orders/AbandonedCartsEmptyState';
import AbandonedCartsHeader from '../../components/orders/AbandonedCartsHeader';
import AbandonedCartsList from '../../components/orders/AbandonedCartsList';
import SendRecoveryEmailModal from '../../components/orders/SendRecoveryEmailModal';
import { useAbandonedCarts } from '../../contexts/abandoned-cart.context';
import { useStore } from '../../contexts/store.context';
import { buildRecoveryEmailTemplate } from '../../utils/recovery-email-templates';

const AbandonedCartsPage: React.FC = () => {
  const navigate = useNavigate();
  const { abandonedCarts, loading, error, fetchAbandonedCartsByStoreId } = useAbandonedCarts();
  const { activeStoreId } = useStore();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('custom');

  useEffect(() => {
    if (activeStoreId) {
      fetchAbandonedCartsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchAbandonedCartsByStoreId]);

  const handleRefresh = useCallback(() => {
    if (activeStoreId) {
      fetchAbandonedCartsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchAbandonedCartsByStoreId]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getInitials = useCallback((firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, []);

  const handleSendEmail = useCallback((customer: any) => {
    const template = buildRecoveryEmailTemplate('custom', customer?.firstName);
    setSelectedCustomer(customer);
    setEmailTemplate('custom');
    setEmailSubject(template.subject);
    setEmailBody(template.bodyHtml);
    setIsEmailModalOpen(true);
  }, []);

  const handleCloseEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
    setSelectedCustomer(null);
    setEmailSubject('');
    setEmailBody('');
    setEmailTemplate('custom');
  }, []);

  const handleSendEmailSubmit = useCallback(() => {
    console.log('Sending email to:', selectedCustomer?.email);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('Template:', emailTemplate);
    handleCloseEmailModal();
  }, [selectedCustomer?.email, emailSubject, emailBody, emailTemplate, handleCloseEmailModal]);

  const handleTemplateChange = useCallback(
    (template: string) => {
      setEmailTemplate(template);
      const next = buildRecoveryEmailTemplate(template, selectedCustomer?.firstName);
      setEmailSubject(next.subject);
      setEmailBody(next.bodyHtml);
    },
    [selectedCustomer?.firstName]
  );

  const handleViewDetails = useCallback(
    (customerId: string) => {
      navigate(`/orders/abandoned-carts/customer/${customerId}`);
    },
    [navigate]
  );

  const handleViewCustomer = useCallback(
    (customerId: string) => {
      navigate(`/customers/${customerId}`);
    },
    [navigate]
  );

  const { totalLineItems, totalEstimatedValue } = useMemo(() => {
    let lineItems = 0;
    let value = 0;
    for (const c of abandonedCarts) {
      lineItems += c.totalItems;
      for (const item of c.cartItems) {
        value += item.productVariant.price * item.quantity;
      }
    }
    return { totalLineItems: lineItems, totalEstimatedValue: value };
  }, [abandonedCarts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto flex min-h-[50vh] max-w-[1440px] items-center justify-center px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200/80 bg-white px-10 py-12 shadow-sm">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
              aria-hidden
            />
            <p className="text-sm font-medium text-gray-600">Loading abandoned carts…</p>
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
              <h2 className="text-sm font-semibold text-red-900">Couldn&apos;t load abandoned carts</h2>
              <p className="mt-1 text-sm text-red-800/90">{error}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-8 space-y-6">
          <nav aria-label="Breadcrumb">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
              Orders
            </button>
          </nav>

          <AbandonedCartsHeader
            cartCount={abandonedCarts.length}
            totalLineItems={totalLineItems}
            totalEstimatedValue={totalEstimatedValue}
            loading={loading}
            onRefresh={handleRefresh}
          />
        </header>

        {abandonedCarts.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <AbandonedCartsEmptyState />
          </div>
        ) : (
          <AbandonedCartsList
            carts={abandonedCarts}
            getInitials={getInitials}
            formatDate={formatDate}
            onSendEmail={handleSendEmail}
            onViewDetails={handleViewDetails}
            onViewCustomer={handleViewCustomer}
          />
        )}
      </div>

      <SendRecoveryEmailModal
        isOpen={isEmailModalOpen}
        customer={selectedCustomer}
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

export default AbandonedCartsPage;
