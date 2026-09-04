import {
  BellIcon,
  CodeBracketIcon,
  CubeIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddSenderEmailModal from '../../components/AddSenderEmailModal';
import NotificationList from '../../components/NotificationList';
import SenderEmailSection from '../../components/SenderEmailSection';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';
import { useNotificationCategories } from '../../contexts/notification-categories.context';
import { useStoreNotificationEmail } from '../../contexts/store-notification-email.context';
import { useStore } from '../../contexts/store.context';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const {
    storeNotificationEmail,
    loading: storeNotificationEmailLoading,
    getByStoreId,
    create,
  } = useStoreNotificationEmail();
  const { categories, fetchAll, loading: categoriesLoading } = useNotificationCategories();
  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId).catch(() => {
        // Error handling managed in context - 404 is expected if no email exists yet
      });
    }
  }, [activeStoreId, getByStoreId]);

  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      fetchAll().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryIcon = useCallback((name: string) => {
    const key = name.toLowerCase();
    const iconClass = 'h-5 w-5 text-admin-text-secondary';
    if (key.includes('customer')) return <UserIcon className={iconClass} />;
    if (key.includes('staff')) return <UsersIcon className={iconClass} />;
    if (key.includes('fulfillment')) return <CubeIcon className={iconClass} />;
    return <BellIcon className={iconClass} />;
  }, []);

  const getCategorySlug = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes('customer')) return 'customer';
    if (key.includes('staff')) return 'staff';
    if (key.includes('fulfillment')) return 'fulfillment-request-notification';
    return key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const getCategoryPath = (categoryId: string, name: string) => {
    const slug = getCategorySlug(name);
    return `/settings/notifications/${categoryId}/${slug}`;
  };

  const handleOpenAddEmailModal = useCallback(() => {
    setAddEmailModalOpen(true);
    setEmailInput('');
  }, []);

  const handleCloseAddEmailModal = useCallback(() => {
    setAddEmailModalOpen(false);
    setEmailInput('');
  }, []);

  const handleAddEmailSubmit = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('No store selected. Please select a store.');
      return;
    }

    if (!emailInput.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      await create({
        storeId: activeStoreId,
        email: emailInput.trim().toLowerCase(),
        isVerified: false,
      });
      toast.success('Email added successfully');
      handleCloseAddEmailModal();
      await getByStoreId(activeStoreId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add email';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [activeStoreId, emailInput, create, getByStoreId, handleCloseAddEmailModal]);

  const dynamicItems = [
    ...categories.map((c) => ({
      icon: getCategoryIcon(c.name),
      title: c.name,
      description: c.description || '',
      path: getCategoryPath(c._id, c.name),
    })),
    {
      icon: <CodeBracketIcon className="h-5 w-5 text-admin-text-secondary" />,
      title: 'Webhooks',
      description: 'Send XML or JSON notifications about store events to a URL',
      path: '/settings/notifications/webhooks',
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <SettingsHero
          title="Notifications"
          description="Configure sender email, notification categories, and webhooks."
        />

        <SenderEmailSection
          loading={storeNotificationEmailLoading}
          storeId={activeStoreId}
          storeNotificationEmail={storeNotificationEmail}
          onOpenAddEmailModal={handleOpenAddEmailModal}
        />

        <AddSenderEmailModal
          open={addEmailModalOpen}
          onClose={handleCloseAddEmailModal}
          emailInput={emailInput}
          onEmailInputChange={(e) => setEmailInput(e.target.value)}
          onSubmit={handleAddEmailSubmit}
          saving={saving}
        />

        <NotificationList items={dynamicItems} onNavigate={navigate} />
      </div>
    </div>
  );
};

export default NotificationsPage;
