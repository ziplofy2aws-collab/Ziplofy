import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../../components/admin-list-ui';
import AbandonedCartsEmptyState from '../../components/orders/AbandonedCartsEmptyState';
import AbandonedCartsHeader from '../../components/orders/AbandonedCartsHeader';
import AbandonedCartsList from '../../components/orders/AbandonedCartsList';
import SendRecoveryEmailModal from '../../components/orders/SendRecoveryEmailModal';
import { useAbandonedCarts } from '../../contexts/abandoned-cart.context';
import { useStore } from '../../contexts/store.context';
import { buildRecoveryEmailTemplate } from '../../utils/recovery-email-templates';
import { sendAbandonedCartRecoveryEmail } from '../../utils/send-abandoned-cart-recovery-email';

const AbandonedCartsPage: React.FC = () => {
  const navigate = useNavigate();
  const { abandonedCarts, loading, error, fetchAbandonedCartsByStoreId } = useAbandonedCarts();
  const { activeStoreId, stores } = useStore();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
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

  const handleSendEmail = useCallback(
    (customer: any) => {
      const template = buildRecoveryEmailTemplate('custom', customer?.firstName, storeName);
      setSelectedCustomer(customer);
      setEmailTemplate('custom');
      setEmailSubject(template.subject);
      setEmailBody(template.bodyHtml);
      setIsEmailModalOpen(true);
    },
    [storeName]
  );

  const handleCloseEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
    setSelectedCustomer(null);
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
        customerFirstName: selectedCustomer?.firstName,
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
    selectedCustomer?.firstName,
    emailSubject,
    emailBody,
    handleCloseEmailModal,
  ]);

  const handleTemplateChange = useCallback(
    (template: string) => {
      setEmailTemplate(template);
      const next = buildRecoveryEmailTemplate(template, selectedCustomer?.firstName, storeName);
      setEmailSubject(next.subject);
      setEmailBody(next.bodyHtml);
    },
    [selectedCustomer?.firstName, storeName]
  );

  const handleViewDetails = useCallback(
    (customerId: string) => {
      navigate(`/orders/abandoned-carts/customer/${customerId}`);
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

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <AbandonedCartsHeader
          cartCount={abandonedCarts.length}
          totalLineItems={totalLineItems}
          totalEstimatedValue={totalEstimatedValue}
          loading={loading}
          onRefresh={handleRefresh}
        />

        <div className={adminListCardClass}>
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
              <p className="mt-4 text-[13px] text-admin-text-secondary">Loading abandoned carts…</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center bg-admin-surface px-6 py-12 text-center">
              <p className="text-[13px] text-red-600">{error}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-4 text-[13px] font-medium text-admin-text hover:underline"
              >
                Try again
              </button>
            </div>
          ) : abandonedCarts.length === 0 ? (
            <AbandonedCartsEmptyState />
          ) : (
            <AbandonedCartsList
              carts={abandonedCarts}
              formatDate={formatDate}
              onSendEmail={handleSendEmail}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Learn more about abandoned carts
            </a>
          </p>
        </div>
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
        sending={sendingEmail}
      />
    </div>
  );
};

export default AbandonedCartsPage;
