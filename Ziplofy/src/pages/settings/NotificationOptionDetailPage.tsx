import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useNotificationOptions } from '../../contexts/notification-options.context';
import { useNotificationCategories } from '../../contexts/notification-categories.context';
import { useGeneralSettings } from '../../contexts/general-settings.context';
import { useStore } from '../../contexts/store.context';
import type { NotificationOption } from '../../contexts/notification-options.context';
import toast from 'react-hot-toast';
import { useNotificationOverrides } from '../../contexts/notification-overrides.context';

const NotificationOptionDetailPage: React.FC = () => {
  const { categoryId, categorySlug, optionId } = useParams<{ categoryId: string; categorySlug: string; optionId: string }>();
  const navigate = useNavigate();
  const { options, fetchByCategoryId } = useNotificationOptions();
  const { categories, fetchAll: fetchCategories } = useNotificationCategories();
  const { settings, getByStoreId } = useGeneralSettings();
  const { activeStoreId } = useStore();
  const { checkExists, create, remove, clearCacheEntry } = useNotificationOverrides();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [currentOption, setCurrentOption] = useState<NotificationOption | null>(null);
  const [sendTestModalOpen, setSendTestModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toggleState, setToggleState] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [hasOverride, setHasOverride] = useState<boolean | null>(null);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideData, setOverrideData] = useState<{ emailSubject?: string; emailBody?: string; smsData?: string } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');

  const parentPath =
    categoryId && categorySlug
      ? `/settings/notifications/${categoryId}/${categorySlug}`
      : '/settings/notifications';

  const categoryName = useMemo(() => {
    if (!categoryId) return 'Notifications';
    const match = categories.find((c) => c._id === categoryId);
    if (match?.name) return match.name;
    if (categorySlug) {
      return categorySlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Notifications';
  }, [categories, categoryId, categorySlug]);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().catch(() => {
        // handled in context
      });
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (categoryId) {
      fetchByCategoryId(categoryId).catch(() => {
        // handled in context
      });
    }
  }, [categoryId, fetchByCategoryId]);

  // Find the option by id
  useEffect(() => {
    if (optionId && options.length > 0) {
      const found = options.find((opt) => opt._id === optionId);

      if (found) {
        setCurrentOption(found);
        setToggleState(found.toggle || false);
        // Set default tab based on what's supported
        if (found.smsSupported && !found.emailSupported) {
          setActiveTab('sms');
        } else {
          setActiveTab('email');
        }
      } else {
        setCurrentOption(null);
      }
    }
    // Reset override state when option changes
    setHasOverride(null);
    setOverrideId(null);
    setOverrideData(null);
    setCheckedOverrideKey(null);
    // Clear cache entry for the previous option to force fresh fetch
    if (activeStoreId && optionId) {
      clearCacheEntry(activeStoreId, optionId);
    }
  }, [optionId, options, activeStoreId, clearCacheEntry]);

  // Fetch general settings to get sender email
  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  // Check override existence and toast once per storeId:optionId
  const [checkedOverrideKey, setCheckedOverrideKey] = useState<string | null>(null);
  useEffect(() => {
    if (!activeStoreId || !optionId) return;
    const key = `${activeStoreId}:${optionId}`;
    if (checkedOverrideKey === key) return;

    // Force refresh to ensure we get the latest data
    checkExists(activeStoreId, optionId, true)
      .then((res) => {
        setCheckedOverrideKey(key);
        setHasOverride(res.exists);
        console.log('Override check result:', res.exists); // Debug log
        if (res.exists && res.override) {
          setOverrideId(res.override._id);
          setOverrideData({
            emailSubject: res.override.emailSubject,
            emailBody: res.override.emailBody,
            smsData: res.override.smsData,
          });
        } else {
          setOverrideId(null);
          setOverrideData(null);
        }
      })
      .catch((err) => {
        console.error('Error checking override:', err);
        // Set to false on error to show default badge
        setHasOverride(false);
        setOverrideId(null);
        setOverrideData(null);
      });
  }, [activeStoreId, optionId, checkExists, checkedOverrideKey]);

  const handleBack = () => {
    if (categoryId && categorySlug) {
      navigate(parentPath, { state: { categoryId } });
    } else {
      navigate('/settings/notifications');
    }
  };

  const handleSendTest = () => {
    setSendTestModalOpen(true);
  };

  const handleCloseSendTestModal = () => {
    setSendTestModalOpen(false);
  };

  const handleSendTestEmail = async () => {
    setSending(true);
    try {
      // TODO: Implement API call to send test email
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Test email sent successfully');
      setSendTestModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const senderEmail = settings?.storeEmail || 'developer200419@gmail.com';

  const handleToggleChange = async (checked: boolean) => {
    setToggleState(checked);
    try {
      // TODO: Implement API call to update toggle state
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      toast.success('Notification setting updated');
    } catch (error: any) {
      // Revert on error
      setToggleState(!checked);
      toast.error(error?.message || 'Failed to update notification setting');
    }
  };

  const handleEditCode = () => {
    if (!categoryId || !categorySlug || !optionId) return;
    navigate(`/settings/notifications/${categoryId}/${categorySlug}/${optionId}/edit`, {
      state: {
        categoryId,
        parentPath,
        categoryName,
      },
    });
  };

  const handleOpenEdit = () => {
    if (currentOption) {
      // Use override values if they exist, otherwise use default values
      const subject = overrideData?.emailSubject ?? currentOption.emailSubject ?? '';
      const body = overrideData?.emailBody ?? currentOption.emailBody ?? '';
      setEditedSubject(subject);
      setEditedBody(body);
      setEditModalOpen(true);
    }
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!activeStoreId || !optionId || !currentOption) return;

    try {
      toast.dismiss();
      setEditModalOpen(false);
      
      // Create the override
      const createdOverride = await create({
        storeId: activeStoreId,
        notificationOptionId: optionId,
        emailSubject: editedSubject.trim() || undefined,
        emailBody: editedBody.trim() || undefined,
        enabled: true,
      });

      // Update override data state
      setOverrideId(createdOverride._id);
      setOverrideData({
        emailSubject: createdOverride.emailSubject,
        emailBody: createdOverride.emailBody,
        smsData: createdOverride.smsData,
      });
      setHasOverride(true);

      toast.dismiss();
      toast.success('Email template updated successfully');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || 'Failed to update email template');
      setEditModalOpen(true); // Reopen modal on error
    }
  };

  const handleUseDefault = async () => {
    if (!overrideId) return;

    try {
      toast.dismiss();
      await remove(overrideId);
      
      // Reset override state
      setHasOverride(false);
      setOverrideId(null);
      setOverrideData(null);
      
      // Clear cache entry to force fresh fetch next time
      if (activeStoreId && optionId) {
        clearCacheEntry(activeStoreId, optionId);
      }
      
      toast.dismiss();
      toast.success('Reverted to default notification template');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || 'Failed to revert to default template');
    }
  };

  if (!categoryId || !categorySlug) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <p className="text-sm text-gray-900">Notification category not found.</p>
        </div>
      </div>
    );
  }

  if (!currentOption) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Replace template variables with sample data
  const replaceTemplateVariables = (text: string): string => {
    return text
      .replace(/\{\{customer_name\}\}/g, 'John Doe')
      .replace(/\{\{order_number\}\}/g, '#9999')
      .replace(/\{\{store_name\}\}/g, 'My Store')
      .replace(/\{\{view_order_url\}\}/g, '#')
      .replace(/\{\{store_url\}\}/g, '#')
      .replace(/\{\{return_tracking_url\}\}/g, '#')
      .replace(/\{\{return_label_url\}\}/g, '#')
      .replace(/\{\{account_invite_url\}\}/g, '#')
      .replace(/\{\{account_url\}\}/g, '#')
      .replace(/\{\{password_reset_url\}\}/g, '#')
      .replace(/\{\{new_email\}\}/g, 'newemail@example.com')
      .replace(/\{\{message_body\}\}/g, 'Your message here')
      .replace(/\{\{gift_card_code\}\}/g, 'A1B2 3C4D 5E6F 7G8H')
      .replace(/\{\{gift_card_amount\}\}/g, 'Rs. 100.00')
      .replace(/\{\{shipping_name\}\}/g, 'Steve Shipper')
      .replace(/\{\{shipping_address_line1\}\}/g, '123 Shipping Street')
      .replace(/\{\{shipping_city\}\}/g, 'Shippington')
      .replace(/\{\{shipping_state\}\}/g, 'Kentucky')
      .replace(/\{\{shipping_zip\}\}/g, '40003')
      .replace(/\{\{shipping_country\}\}/g, 'United States')
      .replace(/\{\{shipping_phone\}\}/g, '555-555-SHIP')
      .replace(/\{\{shipping_method\}\}/g, 'Generic Shipping')
      .replace(/\{\{tracking_number\}\}/g, 'None')
      .replace(/\{\{customer_email\}\}/g, 'jon@example.com');
  };

  // Render email preview HTML from actual emailBody
  const renderEmailPreview = () => {
    // Use override emailBody if it exists, otherwise use default
    const emailBody = overrideData?.emailBody ?? (currentOption.emailBody || '<p>No email template available.</p>');
    const processedHtml = replaceTemplateVariables(emailBody);

    return (
      <div className="rounded-lg border border-gray-200 p-3 bg-white max-w-[600px] overflow-auto">
        <div
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          className="[&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_*]:box-border"
        />
      </div>
    );
  };

  // Render SMS preview from actual smsData
  const renderSMSPreview = () => {
    // Use override smsData if it exists, otherwise use default
    const smsData = overrideData?.smsData ?? (currentOption.smsData || 'No SMS template available.');
    const processedSms = replaceTemplateVariables(smsData);

    return (
      <>
        <div className="rounded-lg border border-gray-200 p-3 bg-white max-w-[600px] mb-3">
          <p className="text-gray-900 whitespace-pre-wrap break-words text-sm leading-relaxed">
            {processedSms}
          </p>
        </div>

        {/* SMS Notifications Information Section */}
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/80 max-w-[600px]">
          <h3 className="text-sm font-medium text-gray-900 mb-2">SMS notifications</h3>
          <p className="text-sm text-gray-500 mb-2">
            Transactional SMS notifications can't be edited. Customer name, order number, and other specific details will automatically update with the correct information.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Navigate to SMS notifications documentation
            }}
            className="text-sm text-gray-700 font-medium hover:underline"
          >
            Learn more about SMS notifications.
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="mt-0.5 inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {currentOption.optionName}
                </h1>
                {hasOverride === false && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200">
                    Default
                  </span>
                )}
                {hasOverride === true && (
                  <>
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200">
                      Custom
                    </span>
                    <button
                      type="button"
                      onClick={handleUseDefault}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Use default
                    </button>
                  </>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {categoryName} • Preview and customize notification templates.
              </p>
              {currentOption.toggle === true && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Enable this notification</span>
                  <ToggleSwitch
                    checked={toggleState}
                    onChange={handleToggleChange}
                  />
                </div>
              )}
            </div>
          </div>
          {activeTab === 'email' && (
            <button
              type="button"
              onClick={handleSendTest}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              Send test
            </button>
          )}
        </header>

        {/* Email/SMS Preview Section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Preview</span>
              {activeTab === 'email' && currentOption?.emailSupported && (
                <button
                  onClick={handleOpenEdit}
                  type="button"
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200 bg-white"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Tabs for Email and SMS */}
          {(currentOption.emailSupported || currentOption.smsSupported) && (
            <div className="border-b border-gray-200 mb-3">
              <div className="flex gap-4">
                {currentOption.emailSupported && (
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`pb-2 px-1 text-xs font-medium transition-colors ${
                      activeTab === 'email'
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Email
                  </button>
                )}
                {currentOption.smsSupported && (
                  <button
                    onClick={() => setActiveTab('sms')}
                    className={`pb-2 px-1 text-xs font-medium transition-colors ${
                      activeTab === 'sms'
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    SMS
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Email Preview */}
          {activeTab === 'email' && currentOption.emailSupported && (
            <>
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">
                  Subject: {overrideData?.emailSubject ?? (currentOption.emailSubject || 'No subject')}
                </p>
              </div>
              {renderEmailPreview()}
            </>
          )}

          {/* SMS Preview */}
          {activeTab === 'sms' && currentOption.smsSupported && (
            <>
              {renderSMSPreview()}
            </>
          )}
        </div>

        {/* Send Test Email Modal */}
        <Modal
          open={sendTestModalOpen}
          onClose={handleCloseSendTestModal}
          title="Send test email"
          maxWidth="sm"
          actions={
            <>
              <button
                onClick={handleCloseSendTestModal}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sending}
                className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            Email will be sent to {senderEmail}
          </p>
        </Modal>

        {/* Edit Email Template Modal */}
        <Modal
          open={editModalOpen}
          onClose={handleCloseEdit}
          title="Edit email template"
          maxWidth="md"
          actions={
            <>
              <button
                onClick={handleCloseEdit}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Body</label>
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={10}
                className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-y"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default NotificationOptionDetailPage;

